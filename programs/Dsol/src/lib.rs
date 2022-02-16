// use std::borrow::Borrow;

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
    pub next_inflation_date: u32,
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
    let next_inflation_timestamp: u32 = current_timestamp + 31536000;

    msg!("Generating PDA");
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"dsol_mint_auth_pda"], program_id);
    let mint_signers_seeds: &[&[u8]; 2] = &[b"dsol_mint_auth_pda", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_account_info.key {
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
        &[]
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
        next_inflation_date: next_inflation_timestamp,

    };
    dsol_data_account.serialize(&mut &mut dsol_data_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn inflate_mint(_program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let dsol_data_account_info = next_account_info(account_info_iter)?;

    let initial_ammount = 150000000e9 as u64;

    let dsol_data_account: DsolData = try_from_slice_unchecked(&dsol_data_account_info.data.borrow())?;

    // msg!("Mint to payer associated token account"); 
    // invoke_signed(  
    //     &spl_token::instruction::mint_to(
    //         &token_program_info.key, 
    //         &mint_info.key, 
    //         &associated_account_info.key, 
    //         &mint_authority_account_info.key, 
    //         &[], 
    //         150000000e9 as u64
    //     )?, 
    //     &[mint_info.clone(), associated_account_info.clone(), mint_authority_account_info.clone()], 
    //     &[mint_signers_seeds]
    // )?;

    // msg!("Transfer tokens to Dsol wallet token account");
    // invoke(
    //     &spl_token::instruction::transfer(
    //         &token_program_info.key,
    //         &associated_account_info.key,
    //         &dsol_wallet_associated_token_account_info.key,
    //         &payer_account_info.key,
    //         &[],
    //         150000000e9 as u64
    //     )?, 
    //     &[associated_account_info.clone(), dsol_wallet_associated_token_account_info.clone(), payer_account_info.clone()], 
    // )?;

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