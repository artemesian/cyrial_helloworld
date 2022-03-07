use borsh::{BorshDeserialize, BorshSerialize};
use global_repo::error::GlobalError;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    clock::Clock,
    msg,
    hash,
    borsh::{try_from_slice_unchecked},
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program_error::ProgramError, program_pack::Pack,
};
use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};
use spl_token::{instruction::*,state::Account};
use metaplex_token_metadata::{instruction, state::{Creator, Metadata}};
use metaplex_token_metadata::id;
extern crate global_repo;


// use solana_sdk::{borsh::try_from_slice_unchecked};
use std::str::FromStr;
entrypoint!(process_instructions);


#[derive(BorshSerialize, BorshDeserialize)]
struct Payment{
    amount: u64,
    time: u32
}

#[derive(BorshSerialize, BorshDeserialize)]
struct ProposalLockGovernor{
    time: u32,
} 
#[derive(BorshSerialize, BorshDeserialize)]
struct Loan{
    mint: [u8;32],
    initial_amount: u64,
    amount_left: u64,
    payments: Vec<Payment>,
    monthly_interest_numerator: u32,
    monthly_interest_denominator: u32,
    initial_loan_date: u32,
    last_pay_date: u32,
    is_loan_active: bool
}

#[derive(BorshSerialize, BorshDeserialize)]
struct LoanLoc{
    payer: [u8;32], 
    bump: u32
}

#[derive(BorshSerialize, BorshDeserialize)]
struct AllLoans{
   all_loans: Vec<LoanLoc>
}
#[derive(BorshSerialize, BorshDeserialize, Copy, Clone)]
pub struct GovernorSales{
    pub vault_total: u64,
    pub counter: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct GovernorData{
    pub date_created: u32,
    pub unlockable_date: u32,
    pub numeration: u32,
    pub rarity: u8,
    pub level: u8,
    pub xp: u32,
}

pub fn lock_time(counter:f32)->u32{
    let mut e_power:f32  = (80000.0 - counter) / 50000.0;
    e_power = e_power.powf(5.0);
    e_power = 1.0 + std::f32::consts::E.powf(e_power);
    (365.0 * 8640.0 / e_power) as u32
}

fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}

fn select_uri<'life>(mut ind: u32, rarity:Option<u8>) -> (&'life str, u8) {


    let new_ind = match rarity{
         Some(rar) => {
            ind = ind - (ind % 1000);
             match rar{
                //  7 =>{689}
                //  6 =>{435}
                //  5 =>{610}
                //  4 =>{555}
                //  3 =>{50}
                //  2 =>{850}
                 _ => {700}
             }
         }
         None => {ind % 1000}
    };
    //Unseen
    if new_ind >= 689 && new_ind < 672{// 0.3%
        let governors = ["https://arweave.net/Q-I6v_z3MjL877Czaljgk7pz5iRXbtgApW-o0RqYrWg"];
        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 7)
    }
    //Exalted
    else if new_ind >= 432 && new_ind <442 { // 1.0%
        let governors = ["https://arweave.net/_RM4x73TluNcMCIx8mrI9PopQeQkBfsEjX-rrujwFvg"];

        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 6)
    }
    //Epic
    else if new_ind >= 550 && new_ind < 600{//5.0%
        let governors =["https://arweave.net/eP77-xr2Nq6DrpcEXFo-1Oo6dFPTRsyKVczjm0rMlbY"];

        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 4)
    }
    //Rare
    else if new_ind < 120{//12.0%
        let governors =  ["https://arweave.net/QoNfFG8DY7jRFZXHGUXG-vqVJ30UknIf_vKWlSeLlYM"];
        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 3)
    }
    //Uncommon
    else if new_ind > 750{ //25.0%
        let governors = ["https://arweave.net/71Bjq4M8mcTmntK5no8ve7yQyN1JBD5VBhAodYubcX0"];

        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 2)
    }
    //Common
    else { // 57.7%
        let governors = ["https://arweave.net/pmASLjixcfT6YRjdbwuCBJJwT0cmiQqxHyq0kZVrlSs"];
        (governors[((ind -new_ind) as f32 / 1000.0) as usize % governors.len()], 1)
    }

}


fn get_price(sales_account_data:GovernorSales) -> u64{
    (sales_account_data.vault_total as f64 * 1.25 / sales_account_data.counter as f64) as u64
}

fn mint_nft(program_id: &Pubkey, accounts: &[AccountInfo], selected_rarity: Option<u8>) -> ProgramResult{
    
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let governor_data_pda_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let metadata_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let avatar_mint_info = next_account_info(account_info_iter)?;
    let creator_account_info = next_account_info(account_info_iter)?;
    let avatar_metadata_account_info = next_account_info(account_info_iter)?;
    let avatar_associated_account_info = next_account_info(account_info_iter)?;

    //TODO: add a check for the creator_account_info

    
    // let associated_token_program_info = next_account_info(account_info_iter)?;
    let temp_key = global_repo::governor::vault::id();
    if vault.key != &temp_key {
        msg!("Problem with vault");
        Err(ProgramError::InvalidAccountData)?
    }


    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &avatar_mint_info.key.to_bytes()], &id());

    if *avatar_metadata_account_info.key != metadata_pda{
        msg!("problem with Avatar metatdata");
        Err(ProgramError::InvalidAccountData)?
    }

    let metadata = Metadata::from_account_info(avatar_metadata_account_info)?;

    match metadata.data.creators{
        Some(creators) =>{
            let mut found = false;
            for creator in creators.iter(){
                if &creator.address == creator_account_info.key{
                    if creator.verified{
                        found = true;
                        break;
                    }
                    else{
                        msg!("NFT, Not signed by Creator");
                        Err(ProgramError::InvalidAccountData)?
                    }
                }
            }
            if !found {
                msg!("NFT, Wrong Creator in Account Sent");
                Err(ProgramError::InvalidAccountData)?
            }
        }
        None => {msg!("Cannot Certify Authenticity of this NFT"); Err(ProgramError::InvalidAccountData)?}
    }

    let associated_mint_account = get_associated_token_address(payer_account_info.key, avatar_mint_info.key);
    if associated_mint_account != *avatar_associated_account_info.key{
        msg!("{:?} <------> {:?}", associated_mint_account, avatar_associated_account_info.key);
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("checkpoint_1");
    let associated_account_info_data = Account::unpack(&avatar_associated_account_info.data.borrow())?;
    msg!("checkpoint_2");
    if associated_account_info_data.amount != 1{
        msg!("Problem with balance of avatar account's mint");
        Err(ProgramError::Custom(1))?
    }

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;

    // let instruction = Instructions::unpackinst(instruction_data)?;

    // let program_id = next_account_info(account_info_iter)?;
    let space: usize = 82;
    let rent_lamports = Rent::get()?.minimum_balance(space);

    let sales_pda_seeds: &[&[u8]; 2]= &[b"sales_pda", &program_id.to_bytes()];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("{:?} <-------> {:?}", sales_pda, sales_pda_info.key);
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("{:?}",&sales_pda_info.data);
    let mut sales_account_data: GovernorSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    // let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = (sales_account_data.vault_total as f64 * 1.25 / sales_account_data.counter as f64) as u64;

    let price = get_price(sales_account_data);

    msg!("Current timestamp: {:?}", current_timestamp);
    let locked_time = lock_time(sales_account_data.counter as f32);
    msg!("Locked time: {:?}", locked_time);
    let unlockable_date: u32 = current_timestamp + locked_time;


    // let rent = Rent::from_account_info(rent_account_info)?;
    msg!("Hello_0");
    invoke(
        &system_instruction::transfer(&payer_account_info.key, &vault.key, price),
        &[payer_account_info.clone(), vault.clone()],
    )?;
    // msg!(
    //     "{:?} {:?} {:?} {:?} {:?}",
    //     payer_account_info,
    //     vault,
    //     mint_account_info,
    //     rent_account_info,
    //     token_program_info
    // );

    let decimals = 0;
    msg!("Hello");
    invoke(
        &system_instruction::create_account(
            &payer_account_info.key,
            &mint_account_info.key,
            rent_lamports,
            82,
            &token_program_info.key,
        ),
        &[payer_account_info.clone(), mint_account_info.clone()],
    )?;
    msg!("Hello2");

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"mint_authority"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"mint_authority", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    invoke(
        &initialize_mint(
            &token_program_info.key,
            &mint_account_info.key,
            &mint_authority_info.key,
            Some(&mint_authority_info.key),
            decimals,
        )?,
        &[
            mint_account_info.clone(),
            rent_account_info.clone(),
            token_program_info.clone(),
        ],
    )?;
    msg!("Hello3");

    invoke(
        &create_associated_token_account(
            payer_account_info.key,
            payer_account_info.key,
            mint_account_info.key,
        ),
        &[
            payer_account_info.clone(),
            associated_account_info.clone(),
            payer_account_info.clone(),
            mint_account_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ],
    )?;
    msg!("Hello4");

    invoke_signed(
        &mint_to(
            &token_program_info.key,
            &mint_account_info.key,
            &associated_account_info.key,
            &mint_authority_info.key,
            &[],
            1,
        )?,
        &[
            mint_account_info.clone(),
            associated_account_info.clone(),
            mint_authority_info.clone(),
        ],
        &[signers_seeds],
    )?;

    msg!("Hello_C");

    let mut creators = Vec::new();
    creators.push(Creator{address: *mint_authority_info.key, verified: true, share: 0});
    creators.push(Creator{address: *vault.key, verified: false, share:100});

    let mut ves: [u8; 10] = [0;10];
    let mut mult = current_timestamp as f32;
    let mut cnt = 0;

    msg!("Hello_C_1");

    while cnt <10 {
        ves[cnt] = (mult as u32 % 256) as u8;
        mult = mult / 7.0;
        cnt += 1;
    }
    let new_hash = hash::hashv(&[&ves, &mint_account_info.key.to_bytes(), &program_id.to_bytes()]);
    let mut index_uri: u32 = 0;
    for i in new_hash.to_bytes().iter(){
        index_uri += (*i as u32) * (*i as u32);
    }
    msg!("Hello_C_0");

    let (selected_uri, rarity) = select_uri(index_uri, selected_rarity);

    msg!("Hello_C_2");

    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    if *metadata_pda_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    msg!("Hello_C_3");
    invoke_signed(
        &instruction::create_metadata_accounts(id(), *metadata_pda_info.key, *mint_account_info.key, *mint_authority_info.key, *payer_account_info.key, *mint_authority_info.key, "DSOL Governor".to_string(), "DSOLG".to_string(), selected_uri.to_string(), Some(creators), 500, true, true),
        &[
            metadata_pda_info.clone(),
            mint_account_info.clone(),
            mint_authority_info.clone(),
            payer_account_info.clone(),
            mint_authority_info.clone(),
            system_account_info.clone(),
            rent_account_info.clone(),
        ],
        &[signers_seeds]
    )?;

    msg!("Hello_C_4");

    invoke_signed(
        &instruction::update_primary_sale_happened_via_token(id(), *metadata_pda_info.key, *payer_account_info.key, *associated_account_info.key),
        &[
            metadata_pda_info.clone(),
            payer_account_info.clone(),
            associated_account_info.clone()
            ],
        &[signers_seeds]
    )?;

    msg!("Hello5");

    invoke_signed(
        &set_authority(
            &token_program_info.key,
            &mint_account_info.key,
            None,
            AuthorityType::MintTokens,
            &mint_authority_info.key,
            &[],
        )?,
        &[mint_account_info.clone(), mint_authority_info.clone()],
        &[signers_seeds],
    )?;
    msg!("Hello6");

    invoke_signed(
        &freeze_account(
            &token_program_info.key,
            &associated_account_info.key,
            &mint_account_info.key,
            &mint_authority_info.key,
            &[]
        )?,
        &[
            associated_account_info.clone(),
            mint_account_info.clone(),
            mint_authority_info.clone(),
        ],
        &[signers_seeds],

    )?;
    msg!("Hello7");

    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &mint_account_info.key.to_bytes(),
    ];
    let (governor_data_pda, governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, program_id); 
    if governor_data_pda_info.key != &governor_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello8");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &governor_data_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), governor_data_pda_info.clone()],
        &[
            &[        
                b"governor_data_pda",
                &mint_account_info.key.to_bytes(),
                &[governor_data_pda_bump]
                ]
                ]
    )?;
    msg!("Hello9");
    let governor_pda_account_data = GovernorData{
        date_created: current_timestamp,
        unlockable_date: unlockable_date,
        numeration: sales_account_data.counter,
        rarity: rarity,
        level: 0,
        xp: 0,
    };
    governor_pda_account_data.serialize(&mut &mut governor_data_pda_info.data.borrow_mut()[..])?;
    msg!("Hello_a");

    // invoke_signed(
    //     &system_instruction::create_account(
    //         &payer_account_info.key,
    //         &sales_pda_info.key,
    //         Rent::get()?.minimum_balance(200),
    //         200,
    //         &program_id,
    //     ),
    //     &[payer_account_info.clone(), sales_pda_info.clone()],
    //     &[
    //         &[        
    //             b"sales_pda",
    //             &program_id.to_bytes() as &[u8],
    //             &[_sales_pda_bump]
    //             ]
    //             ]
    // )?;

    msg!("Hello_b");
    sales_account_data.vault_total += unitary;
    sales_account_data.counter += 1;
    
    // let sales_account_data = Sales{
    //     vault_total : 1.0,
    //     counter :  1
    // };

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;

    msg!("Locked for {:?} seconds", unlockable_date - current_timestamp);
    Ok(())
}

pub enum InstructionEnum{
    MintNft,
    UnlockMint,
    CreateSalesAccount,
    FreezeGov, 
    TakeLoan{amount: u64, storage_bump: u32}, 
    PayLoan{amount: u64, storage_bump: u32}, 
    BorrowMore{amount: u64, storage_bump: u32},
}


impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        match data[0]{
            0 => {Ok(Self::MintNft)}
            1 => {Ok(Self::UnlockMint)}
            2 => {
                    let total = ((get_num_cnt(&data[1..4]) as f32 +get_num_cnt(&data[4..7]) as f32 / 1000.0) * 1e9) as u64;
                    msg!("Total before multiplication: {:?} <---> Num_Cnt_1: {:?}, <---> Num_Cnt_2 {:?}", total, get_num_cnt(&data[1..4]) as f32 , get_num_cnt(&data[4..7]));
                Ok(Self::TakeLoan{amount:total, storage_bump: get_num_cnt(&data[7..10])})}
            3 => {Ok(Self::CreateSalesAccount)}
            4 => {
                let total = ((get_num_cnt(&data[1..4]) as f32 +get_num_cnt(&data[4..7]) as f32 / 1000.0) * 1e9) as u64;
            Ok(Self::PayLoan{amount:total, storage_bump: get_num_cnt(&data[7..10])})}
            5 => {
                Ok(Self::FreezeGov)}
            6 => {
                let total = ((get_num_cnt(&data[1..4]) as f32 +get_num_cnt(&data[4..7]) as f32 / 1000.0) * 1e9) as u64;
                msg!("Total before multiplication: {:?} <---> Num_Cnt_1: {:?}, <---> Num_Cnt_2 {:?}", total, get_num_cnt(&data[1..4]) as f32 , get_num_cnt(&data[4..7]));
            Ok(Self::BorrowMore{amount:total, storage_bump: get_num_cnt(&data[7..10])})}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn create_sales_account(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let all_loans_list_info = next_account_info(account_info_iter)?;

    let (all_loans_pda, _all_loans_pda_bump) = Pubkey::find_program_address(&[b"All Governor Loans"], program_id);

    if all_loans_pda != *all_loans_list_info.key{
        msg!("All Loans Pdas are not matching");
        Err(GlobalError::KeypairNotEqual)?
    }
    
    if !payer_account_info.is_signer || payer_account_info.key != &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(ProgramError::InvalidAccountData)?
    } 

    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }



    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &sales_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), sales_pda_info.clone()],
        &[
            &[        
                b"sales_pda",
                &program_id.to_bytes() as &[u8],
                &[_sales_pda_bump]
                ]
                ]
    )?;


    let sales_account_data = GovernorSales{
        vault_total : 1e9 as u64,
        counter :  1
    };

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;

    create_all_loans_account(program_id, &[payer_account_info.clone(), all_loans_list_info.clone()])?;
    Ok(())
}

fn unlock_account(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let mint_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let governor_data_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;

    msg!("Hello_a");
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"mint_authority"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"mint_authority", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &mint_account_info.key.to_bytes(),
    ];
    let governor_pda_account_data: GovernorData = try_from_slice_unchecked(&governor_data_pda_info.data.borrow())?;
    let (governor_data_pda, _governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, program_id);
    if governor_data_pda_info.key != &governor_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    msg!("Hello_b");
    if current_timestamp > governor_pda_account_data.unlockable_date{
        invoke_signed(
            &thaw_account(
                &token_program_info.key,
                &associated_account_info.key,
                &mint_account_info.key,
                &mint_authority_info.key,
                &[]
            )?,
            &[
                associated_account_info.clone(),
                mint_account_info.clone(),
                mint_authority_info.clone(),
            ],
            &[signers_seeds],

        )?;
    }
    else {
        msg!("This Account's Unlock time hasn't yet reached. It will be unlocked on {:?}. Chech to see you sent the correct account", governor_pda_account_data.unlockable_date);
        return Err(ProgramError::InvalidAccountData );
    }
    Ok(())
}


fn freeze_gov(program_id:&Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    // let payer_account_info = next_account_info(account_info_iter)?;
    let authorizer_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let governor_data_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;

    let (authorizer_pda, _authorizer_pda_bump) = Pubkey::find_program_address(&[b"authorizer_pda"], &global_repo::table::id());
    if &authorizer_pda != authorizer_info.key || !authorizer_info.is_signer {
        Err(ProgramError::InvalidAccountData)?
    }

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"mint_authority"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"mint_authority", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    invoke_signed(
        &freeze_account(
            &token_program_info.key,
            &associated_account_info.key,
            &mint_account_info.key,
            &mint_authority_info.key,
            &[]
        )?,
        &[
            associated_account_info.clone(),
            mint_account_info.clone(),
            mint_authority_info.clone(),
        ],
        &[signers_seeds],

    )?;

    let mut governor_data: GovernorData = try_from_slice_unchecked(&governor_data_pda_info.data.borrow())?;
    msg!("Reached checkpoint 2");
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    let proposal_lock_governor = ProposalLockGovernor{
        time: (5.0 * 30.44 * 86400.0) as u32,
    };

    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &mint_account_info.key.to_bytes(),
    ];
    let (governor_data_pda, _governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, &global_repo::governor::id()); 
    if governor_data_pda_info.key != &governor_data_pda{
        msg!("Governor pdas don't match");
        Err(ProgramError::InvalidAccountData)?
    }

    governor_data.unlockable_date = current_timestamp + proposal_lock_governor.time;
    governor_data.serialize(&mut &mut governor_data_pda_info.data.borrow_mut()[..])?;

    Ok(())
}


fn take_loan(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64, storage_bump: u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let all_loans_list_info = next_account_info(account_info_iter)?;
    let storage_pda_info = next_account_info(account_info_iter)?;
    let storage_associated_account_info = next_account_info(account_info_iter)?;
    let vault_pda_info = next_account_info(account_info_iter)?;
    let governor_data_pda_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;


    let space: usize = 200;
    let lamports = Rent::get()?.minimum_balance(space);

    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("Sales pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    let sales_data: GovernorSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    if amount > (0.7*sales_data.vault_total as f64 /sales_data.counter as f64) as u64{
        msg!("requested borrow ammount exceeds 70% of the average backing per governor");
        Err(GlobalError::TooMuchRequestedAmount)?
    }


    let (all_loans_pda, _all_loans_pda_bump) = Pubkey::find_program_address(&[b"All Governor Loans"], program_id);

    if all_loans_pda != *all_loans_list_info.key{
        msg!("All Loans Pdas are not matching");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut all_loans: AllLoans = try_from_slice_unchecked(&all_loans_list_info.data.borrow())?;


    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;

    let gov_associated_key = get_associated_token_address(payer_account_info.key, mint_account_info.key);

    if *associated_account_info.key != gov_associated_key{
        msg!("Associated account keypairs for governor don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &mint_account_info.key.to_bytes(),
    ];
    let (governor_data_pda, _governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, program_id); 
    if governor_data_pda_info.key != &governor_data_pda{
        msg!("Governor data pads do not match");
        Err(ProgramError::InvalidAccountData)?
    }

    let _: GovernorData = try_from_slice_unchecked(&governor_data_pda_info.data.borrow())?; //Confirming that the Mint account provided is actually a governor.

    invoke(
        &create_associated_token_account(
            payer_account_info.key,
            storage_pda_info.key,
            mint_account_info.key,
        ),
        &[
            payer_account_info.clone(),
            storage_associated_account_info.clone(),
            storage_pda_info.clone(),
            mint_account_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ],
    )?;
    
    msg!("Created associated token account");

    invoke(
        &transfer(
            token_program_info.key,
            associated_account_info.key,
            storage_associated_account_info.key,
            payer_account_info.key,
            &[],
            1
        )?,
        &[
            associated_account_info.clone(),
            storage_associated_account_info.clone(),
            payer_account_info.clone(),
        ]
    )?;


    let (vault, vault_bump) = Pubkey::find_program_address(&[b"Governor_Vault"], program_id);
    if vault != *vault_pda_info.key {
        msg!("Vault pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let (storage_pda, storage_pda_bump) = Pubkey::find_program_address(&[b"Loan_Storage", &payer_account_info.key.to_bytes(), &storage_bump.to_be_bytes()], program_id);
    if storage_pda != *storage_pda_info.key {
        msg!("Storage pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let storage_pda_associated = get_associated_token_address(&storage_pda, mint_account_info.key);
    if storage_pda_associated != *storage_associated_account_info.key{
        msg!("Storage pda assicated keys don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    msg!("about to transfer: {:?}", amount);
    invoke_signed(
        &system_instruction::transfer(&vault, payer_account_info.key, amount as u64),
        &[vault_pda_info.clone(), payer_account_info.clone()],
        &[&[b"Governor_Vault", &[vault_bump]]]
    )?;

    invoke_signed(
        &system_instruction::create_account(
            payer_account_info.key,
            &storage_pda,
            lamports,
            space as u64,
            program_id
        ),
        &[payer_account_info.clone(), storage_pda_info.clone()],
        &[&[b"Loan_Storage",  &payer_account_info.key.to_bytes(), &storage_bump.to_be_bytes(), &[storage_pda_bump]]]
    )?;

    let mut payments= Vec::new();
    payments.push(Payment{
        amount: 0,
        time: current_timestamp
    });

    let loan = Loan{
        mint: mint_account_info.key.to_bytes(),
        initial_amount: amount,
        amount_left: amount,
        payments: payments,
        monthly_interest_numerator: 1,
        monthly_interest_denominator: 100,
        initial_loan_date: current_timestamp,
        last_pay_date: current_timestamp,
        is_loan_active: true
    };
    all_loans.all_loans.push(LoanLoc{payer: payer_account_info.key.to_bytes(), bump: storage_bump});
    all_loans.serialize(&mut &mut all_loans_list_info.data.borrow_mut()[..])?;

    loan.serialize(&mut &mut storage_pda_info.data.borrow_mut()[..])?;

    

    Ok(())

}

fn create_all_loans_account(program_id: &Pubkey, accounts: &[AccountInfo])-> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let all_loans_list_info = next_account_info(account_info_iter)?;
    


    let space: usize = 10000;
    let lamports = Rent::get()?.minimum_balance(space);

    let (all_loans_pda, all_loans_pda_bump) = Pubkey::find_program_address(&[b"All Governor Loans"], program_id);

    if all_loans_pda != *all_loans_list_info.key{
        msg!("All Loans Pdas are not matching");
        Err(GlobalError::KeypairNotEqual)?
    }

    invoke_signed(
        &system_instruction::create_account(
            payer_account_info.key,
            &all_loans_list_info.key,
            lamports,
            space as u64,
            program_id
        ),
        &[payer_account_info.clone(), all_loans_list_info.clone()],
        &[&[b"All Governor Loans", &[all_loans_pda_bump]]]
    )?;

    let all_loans = AllLoans{
        all_loans : Vec::new(),
    };

    all_loans.serialize(&mut &mut all_loans_list_info.data.borrow_mut()[..])?;
    Ok(())

}

fn pay_loan(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64, storage_bump: u32) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let all_loans_list_info = next_account_info(account_info_iter)?;
    let storage_pda_info = next_account_info(account_info_iter)?;
    let storage_associated_account_info = next_account_info(account_info_iter)?;
    let vault_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;

    let token_program_info = next_account_info(account_info_iter)?;
    // let system_account_info = next_account_info(account_info_iter)?;
    // let rent_account_info = next_account_info(account_info_iter)?;


    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("Sales pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    let mut sales_data: GovernorSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    let (all_loans_pda, _all_loans_pda_bump) = Pubkey::find_program_address(&[b"All Governor Loans"], program_id);

    if all_loans_pda != *all_loans_list_info.key{
        msg!("All Loans Pdas are not matching");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut all_loans: AllLoans = try_from_slice_unchecked(&all_loans_list_info.data.borrow())?;
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;

    let (storage_pda, storage_pda_bump) = Pubkey::find_program_address(&[b"Loan_Storage", &payer_account_info.key.to_bytes(), &storage_bump.to_be_bytes()], program_id);
    if storage_pda != *storage_pda_info.key {
        msg!("Storage pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut loan: Loan = try_from_slice_unchecked(&storage_pda_info.data.borrow())?;

    let gov_associated_key = get_associated_token_address(payer_account_info.key, &Pubkey::new(&loan.mint));

    if *associated_account_info.key != gov_associated_key{
        msg!("Associated account keypairs for governor don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    
    let (vault, _vault_bump) = Pubkey::find_program_address(&[b"Governor_Vault"], program_id);
    if vault != *vault_pda_info.key {
        msg!("Vault pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let storage_pda_associated = get_associated_token_address(&storage_pda, &Pubkey::new(&loan.mint));
    if storage_pda_associated != *storage_associated_account_info.key{
        msg!("Storage pda assicated keys don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    
    if amount < ((loan.monthly_interest_numerator as f64/ loan.monthly_interest_denominator as f64) * loan.amount_left as f64) as u64{
        msg!("Amount attempting to pay with is too miniscule, compared to minimum accepted");
        Err(GlobalError::AmountTooSmall)?
    }

    if current_timestamp - loan.last_pay_date > 2_592_000{
        msg!("Loan was already defaulted or already paid for completeley");
        Err(GlobalError::LoanPaymentError)?
    }
    invoke( 
        &system_instruction::transfer(payer_account_info.key, &vault_pda_info.key, amount as u64),
        &[payer_account_info.clone(), vault_pda_info.clone()]
    )?;

    let mut ch_time = loan.initial_loan_date;
    let mut amount_to_sub = amount;
    while ch_time + 2_592_000 < current_timestamp{
        ch_time += 2_592_000;
    }
    let mut multiplier = 1.0;
    if loan.last_pay_date <= ch_time{
            sales_data.vault_total += ((loan.monthly_interest_numerator as f64 / loan.monthly_interest_denominator as f64) * loan.amount_left as f64 ) as u64;
            amount_to_sub = amount - ((loan.monthly_interest_numerator as f64 / loan.monthly_interest_denominator as f64) * loan.amount_left as f64 ) as u64;
            multiplier += (loan.monthly_interest_numerator as f64 + 0.15)/ loan.monthly_interest_denominator as f64;
    }
    if amount_to_sub as f64 > loan.amount_left as f64 * multiplier{
        msg!("Ammount attempted to pay is exhorbitantly large");
        Err(GlobalError::ExhorbitantAmount)?
    }
    let leftamount= loan.amount_left as i64 - amount_to_sub as i64;
    loan.amount_left -= amount_to_sub;
    

    if leftamount <= 0 {
        all_loans.all_loans.remove(all_loans.all_loans.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.bump == storage_bump).expect("Not so good popping element out of all_loans"));

        invoke_signed(
            &transfer(token_program_info.key, storage_associated_account_info.key, associated_account_info.key, storage_pda_info.key, &[], 1)?,
            &[storage_associated_account_info.clone(), associated_account_info.clone(), storage_pda_info.clone()],
            &[&[b"Loan_Storage", &payer_account_info.key.to_bytes(), &storage_bump.to_be_bytes(), &[storage_pda_bump]]]
        )?;
        loan.is_loan_active = false;
        loan.amount_left = 0;

    }

    loan.payments.push(Payment{amount: amount, time: current_timestamp});
    loan.last_pay_date = current_timestamp;

    loan.serialize(&mut &mut storage_pda_info.data.borrow_mut()[..])?;
    all_loans.serialize(&mut &mut all_loans_list_info.data.borrow_mut()[..])?;
    sales_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;


    Ok(())
}


fn borrow_more(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64, storage_bump: u32) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let storage_pda_info = next_account_info(account_info_iter)?;
    let vault_pda_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;

    // let token_program_info = next_account_info(account_info_iter)?;
    // let system_account_info = next_account_info(account_info_iter)?;
    // let rent_account_info = next_account_info(account_info_iter)?;

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;

    let (storage_pda, _storage_pda_bump) = Pubkey::find_program_address(&[b"Loan_Storage", &payer_account_info.key.to_bytes(), &storage_bump.to_be_bytes()], program_id);
    if storage_pda != *storage_pda_info.key {
        msg!("Storage pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut loan: Loan = try_from_slice_unchecked(&storage_pda_info.data.borrow())?;
    if !loan.is_loan_active{
        msg!("Loan is no longer active");
        Err(GlobalError::NoLongerActive)?
    }
    
    let (vault, vault_bump) = Pubkey::find_program_address(&[b"Governor_Vault"], program_id);
    if vault != *vault_pda_info.key {
        msg!("Vault pda's don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    
    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("Sales pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    let sales_data: GovernorSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;

    if amount + loan.amount_left > (0.7*sales_data.vault_total as f64/sales_data.counter as f64) as u64{
        msg!("Attempting to borrow more than allowable threashold of 70% of average Governor Backing <-----> total: {:?}, <---> {:?}", amount + loan.amount_left, (0.7*sales_data.vault_total as f64/sales_data.counter as f64));
        Err(GlobalError::TooMuchRequestedAmount)?
    }

    if current_timestamp - loan.last_pay_date > 2_592_000{
        msg!("Loan was already defaulted or already paid for completeley");
        Err(GlobalError::LoanPaymentError)?
    }
    invoke_signed( 
        &system_instruction::transfer( &vault_pda_info.key,payer_account_info.key, amount as u64),
        &[vault_pda_info.clone(), payer_account_info.clone()],
        &[&[b"Governor_Vault", &[vault_bump]]]
    )?;

    loan.amount_left += amount;

    loan.serialize(&mut &mut storage_pda_info.data.borrow_mut()[..])?;


    Ok(())
}



pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {

        if program_id != &global_repo::governor::id(){
            Err(ProgramError::IncorrectProgramId)?
        }
        let instruction = InstructionEnum::decode(instruction_data)?;
        match instruction {
            InstructionEnum::MintNft =>{
                mint_nft(program_id, accounts, None)
            }
            InstructionEnum::UnlockMint => {
                unlock_account(program_id, accounts)
            }   
            InstructionEnum::CreateSalesAccount =>{create_sales_account(program_id, accounts)}
            InstructionEnum::FreezeGov => {freeze_gov(program_id, accounts)}
            InstructionEnum::TakeLoan {amount, storage_bump } => {take_loan(program_id, accounts, amount, storage_bump)},
            InstructionEnum::PayLoan {amount, storage_bump} => {pay_loan(program_id, accounts, amount, storage_bump)},
            InstructionEnum::BorrowMore {amount, storage_bump} => {borrow_more(program_id, accounts, amount, storage_bump)},
        }
}

// #[cfg(test)]
// mod tests {


//     #[test]
//     fn it_works() {
//         assert_eq!(5 * 5, 5 * 5);
//     }
// }