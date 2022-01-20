use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    
    program::{invoke, invoke_signed}, 
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program_error::ProgramError,
};
use spl_associated_token_account::create_associated_token_account;
use spl_token::instruction::*;
use metaplex_token_metadata::{instruction, id, state::{Creator}};

// use solana_sdk::{signature::Keypair, signer::Signer};
use std::str::FromStr;
entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Sales{
    pub vault_total: f32,
    pub counter: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct LockTime{
    // pub mint_key: Pubkey,
    // pub associate_token_account_key: Pubkey,
    pub date_created: u32,
    pub unlockable_date: u32
}



pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // let instruction = Instructions::unpackinst(instruction_data)?;
    let unlockable_date: u32 = 2022;

    let account_info_iter = &mut accounts.iter();

    // match instruction {
    //     Instructions::CreateAccount{
    //         // cost
    //     } => {
    // let program_id_account_info = next_account_info(account_info_iter)?;
    let payer_account_info = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let locktime_pda_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let metadata_pda_info = next_account_info(account_info_iter)?;
    // let associated_token_program_info = next_account_info(account_info_iter)?;
    let temp_key = Pubkey::from_str("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z").unwrap();
    if vault.key != &temp_key && program_id == program_id {
        Err(ProgramError::InvalidInstructionData)?
    }

    // let program_id = next_account_info(account_info_iter)?;
    let space: usize = 82;
    let rent_lamports = Rent::get()?.minimum_balance(space);


    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("{:?}",&sales_pda_info.data);
    // let mut sales_account_data = Sales::try_from_slice(&sales_pda_info.data.borrow())?;
    let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    let price = (unitary  * (i32::pow(10,9) as f32)) as u64;

    // let rent = Rent::from_account_info(rent_account_info)?;
    msg!("Hello_0");
    invoke(
        &system_instruction::transfer(&payer_account_info.key, &vault.key, price as u64),
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

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"cyrial_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"cyrial_pda", &[mint_authority_bump]];
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
    creators.push(Creator{address: *mint_authority_info.key, verified: true, share: 100});
    // creators.push(Creator{address: *vault.key, verified:true, share:100});
    
    invoke_signed(
        &instruction::create_metadata_accounts(id(), *metadata_pda_info.key, *mint_account_info.key, *mint_authority_info.key, *payer_account_info.key, *mint_authority_info.key, "Angelo".to_string(), "Gtree".to_string(), "https://arweave.net/UXmk5Y5uoc3HGWW8C4G4c63ajynyR-cP_Ve0G4Rt9Jg".to_string(), Some(creators), 500, true, true),
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


    let locktime_pda_seed: &[&[u8]; 3] = &[
        b"locktime_pda",
        &mint_account_info.key.to_bytes(),
        &associated_account_info.key.to_bytes()
    ];
    let (locktime_pda, locktime_pda_bump) = Pubkey::find_program_address(locktime_pda_seed, program_id); 
    if locktime_pda_info.key != &locktime_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello8");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &locktime_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), locktime_pda_info.clone()],
        &[
            &[        
                b"locktime_pda",
                &mint_account_info.key.to_bytes(),
                &associated_account_info.key.to_bytes(),
                &[locktime_pda_bump]
                ]
                ]
    )?;
    msg!("Hello9");
    let locktime_account_data = LockTime{
        date_created: 2021,
        unlockable_date: unlockable_date,
    };
    locktime_account_data.serialize(&mut &mut locktime_pda_info.data.borrow_mut()[..])?;
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

    Ok(())
}

// #[cfg(test)]
// mod tests {
//     // use std::str::FromStr;

//     // use solana_program::pubkey::Pubkey;

//     #[test]
//     fn it_works() {
//         // let mut x: Option<&Pubkey> = Some(&Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap());
//         assert_eq!(5 * 5, 5 * 5);
//     }
// }
