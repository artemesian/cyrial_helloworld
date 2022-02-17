use solana_program::{
    borsh::{try_from_slice_unchecked},
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    clock::Clock,
    program::{invoke, invoke_signed}, 
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program_error::ProgramError,
};
use borsh::{BorshSerialize, BorshDeserialize};
use spl_associated_token_account;
use spl_token;


entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize)]
pub struct DsolData{
    pub date_created: u32,
    pub last_inflation_date: u32,
}

pub enum InstructionEnum{
    InitialMint,
    InflateMint,
}

impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        match data[0]{
            0 => {Ok(Self::InitialMint)}
            1 => {Ok(Self::InflateMint)}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn initial_mint(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let dsol_wallet_account_info = next_account_info(account_info_iter)?;
    let dsol_wallet_associated_token_account_info = next_account_info(account_info_iter)?;
    let dsol_data_pda_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let mint_authority_account_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;


    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    // Compute the initial next inflation timestamp after 1year
    let last_inflation_timestamp: u32 = current_timestamp;

    msg!("Generating mint Authority PDA");
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"dsol_mint_auth_pda"], program_id);
    let mint_signers_seeds: &[&[u8]; 2] = &[b"dsol_mint_auth_pda", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_account_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    msg!("Generating mint PDA");
    let (mint_pda, mint_bump) = Pubkey::find_program_address(&[b"dsol_mint_pda"], program_id);
    let mint_pda_signer: &[&[u8]; 2] = &[b"dsol_mint_pda", &[mint_bump]];
    if &mint_pda != mint_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    msg!("Create mint account");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &mint_info.key, 
            Rent::get()?.minimum_balance(82),
            82,
            &token_program_info.key
        ), 
        &[payer_account_info.clone(), mint_info.clone()],
        &[mint_pda_signer]
    )?;

    msg!("Init mint account");
    invoke(
        &spl_token::instruction::initialize_mint(
            &token_program_info.key, 
            &mint_info.key,
            &mint_authority_account_info.key,
            Some(&mint_authority_account_info.key),
            9
        )?,
        &[mint_info.clone(), rent_account_info.clone(), token_program_info.clone()]
    )?;

    msg!("Create associated token account");
    invoke(
        &spl_associated_token_account::create_associated_token_account(
            payer_account_info.key, 
            payer_account_info.key,
            mint_info.key
        ),
        &[
            payer_account_info.clone(),
            associated_account_info.clone(),
            payer_account_info.clone(),
            mint_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ]
    )?;

    msg!("Mint to payer associated token account");
    invoke_signed(
        &spl_token::instruction::mint_to(
            &token_program_info.key, 
            &mint_info.key, 
            &associated_account_info.key, 
            &mint_authority_account_info.key, 
            &[], 
            150000000e9 as u64
        )?, 
        &[mint_info.clone(), associated_account_info.clone(), mint_authority_account_info.clone()], 
        &[mint_signers_seeds]
    )?;

    invoke(
        &spl_associated_token_account::create_associated_token_account(
            payer_account_info.key, 
            dsol_wallet_account_info.key,
            mint_info.key
        ),
        &[
            payer_account_info.clone(),
            dsol_wallet_associated_token_account_info.clone(),
            dsol_wallet_account_info.clone(),
            mint_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ]
    )?;

    msg!("Transfer tokens to Dsol wallet token account");
    invoke(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &associated_account_info.key,
            &dsol_wallet_associated_token_account_info.key,
            &payer_account_info.key,
            &[],
            150000000e9 as u64
        )?, 
        &[associated_account_info.clone(), dsol_wallet_associated_token_account_info.clone(), payer_account_info.clone()], 
    )?;
    
    let dsol_data_pda_seed: &[&[u8]; 3] = &[
        b"dsol_data_pda",
        &mint_info.key.to_bytes(),
        &dsol_wallet_associated_token_account_info.key.to_bytes()
    ];

    let (dsol_data_pda, dsol_data_pda_bump) = Pubkey::find_program_address(dsol_data_pda_seed, program_id);
    
    if &dsol_data_pda != dsol_data_pda_info.key {
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Create Dsol Data Account");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &dsol_data_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), dsol_data_pda_info.clone()],
        &[
            &[        
                b"dsol_data_pda",
                &mint_info.key.to_bytes(),
                &dsol_wallet_associated_token_account_info.key.to_bytes(),
                &[dsol_data_pda_bump]
            ]
        ]
    )?;
    msg!("Save Dsol Data");
    let dsol_data_account = DsolData{
        date_created: current_timestamp,
        last_inflation_date: last_inflation_timestamp,

    };
    dsol_data_account.serialize(&mut &mut dsol_data_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn inflate_mint(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let dsol_wallet_associated_token_account_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let dsol_data_pda_info = next_account_info(account_info_iter)?;
    let mint_authority_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;

    let dsol_data_account: DsolData = try_from_slice_unchecked(&dsol_data_pda_info.data.borrow())?;
    let mut last_inflation_timestamp = dsol_data_account.last_inflation_date;
    let mut amount_to_inflate: u64 = 0;
    let clock = Clock::from_account_info(&sysvar_clock_info)?;

    let current_timestamp = clock.unix_timestamp as u32;
    let a_year_timestamp : u32 = 31536000;

    if &current_timestamp - &last_inflation_timestamp < a_year_timestamp  {
        msg!("Remaining {:?} secs from now to the next inflation", &a_year_timestamp - (&current_timestamp - &last_inflation_timestamp));
        Err(ProgramError::InvalidInstructionData)?
    }

    while (&current_timestamp - &last_inflation_timestamp) >= a_year_timestamp {
        let num_years = ((&last_inflation_timestamp + a_year_timestamp) - &dsol_data_account.date_created) / a_year_timestamp;
        
        let inflation_percentage = (5.0 / num_years as f32 ) / 100.0;
        amount_to_inflate += (150000000e9 as f32 * inflation_percentage) as u64;

        msg!("Year: {:?} - inflation percentage: {:?} % - amount inflation: {:?}", num_years, inflation_percentage, amount_to_inflate);
        last_inflation_timestamp += a_year_timestamp;
    }
    

    let (_mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"dsol_mint_auth_pda"], program_id);
    let mint_signers_seeds: &[&[u8]; 2] = &[b"dsol_mint_auth_pda", &[mint_authority_bump]];

    msg!("Mint to payer associated token account"); 
    invoke_signed(  
        &spl_token::instruction::mint_to(
            &token_program_info.key, 
            &mint_info.key, 
            &associated_account_info.key, 
            &mint_authority_account_info.key, 
            &[], 
            amount_to_inflate
            
        )?, 
        &[mint_info.clone(), associated_account_info.clone(), mint_authority_account_info.clone()], 
        &[mint_signers_seeds]
    )?;

    msg!("Transfer tokens to Dsol wallet token account");
    invoke(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &associated_account_info.key,
            &dsol_wallet_associated_token_account_info.key,
            &payer_account_info.key,
            &[],
            amount_to_inflate
        )?, 
        &[associated_account_info.clone(), dsol_wallet_associated_token_account_info.clone(), payer_account_info.clone()], 
    )?;

    msg!("Update Dsol Data");
    let final_dsol_data_account = DsolData{
        date_created: dsol_data_account.date_created,
        last_inflation_date: last_inflation_timestamp,

    };
    final_dsol_data_account.serialize(&mut &mut dsol_data_pda_info.data.borrow_mut()[..])?;

    Ok(())

}

pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
        let instruction = InstructionEnum::decode(instruction_data)?;
        match instruction {
            InstructionEnum::InitialMint => {
                initial_mint(program_id, accounts)
            }
            InstructionEnum::InflateMint => {
                inflate_mint(program_id, accounts)
            }   
        }
}