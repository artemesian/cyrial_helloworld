// use borsh::{BorshDeserialize, BorshSerialize}; 
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    // msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    // sysvar::{rent::Rent, Sysvar},
    system_instruction,
    program::{invoke},
};

use spl_token::{instruction::*};


// use solana_sdk::{signature::Keypair, signer::Signer};
use std::str::FromStr;



entrypoint!(process_instructions);

pub enum Instructions{
    CreateAccount {
        // cost: u64
    },
}

impl Instructions{
    fn unpackinst(input: &[u8]) -> Result<Self, ProgramError>{
        let (&instr, _) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match instr{
            0 => {
                // let (&cost, _) = rest.split_first().ok_or(ProgramError::InvalidInstructionData)?;

                Self::CreateAccount{
                    // cost
                }
    
            }

            _ => return Err(ProgramError::InvalidInstructionData.into())
        })
    }
}




pub fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8])-> ProgramResult{
    let instruction = Instructions::unpackinst(instruction_data)?;

    let account_info_iter =  &mut accounts.iter();

    match instruction {
        Instructions::CreateAccount{
            // cost
        } => {
            let program_id_account_info = next_account_info(account_info_iter)?;
            let payer_account_info = next_account_info(account_info_iter)?;
            let vault = next_account_info(account_info_iter)?;
            let mint_account_info = next_account_info(account_info_iter)?;
            let rent_account_info = next_account_info(account_info_iter)?;
            let associated_account_info = next_account_info(account_info_iter)?; 
            let temp_key = Pubkey::from_str("5qVyTGEhQFd2qDWjFhBquQXrTF11dDtK4zkmGXA8LYU").unwrap();
            if vault.key != &temp_key {
                Err(ProgramError::InvalidInstructionData)?
            }

            // let program_id = next_account_info(account_info_iter)?;
            // let space:usize = 1000;
            // let rent_lamports = Rent::get()?.minimum_balance(space);
            let price: u64 = (0.5 * (i32::pow(10,9)) as f64) as u64;

            // let rent = Rent::from_account_info(rent_account_info)?;
            invoke(
                &system_instruction::transfer(
                    &payer_account_info.key,
                    &temp_key,
                    price,
                ),
                &[
                    payer_account_info.clone(),
                    vault.clone()
                ]
            )?;

            let mint_authority_pubkey = program_id.clone();
            let freeze_authority_pubkey = program_id.clone();
            let decimals = 0;
            let token_program_id = Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap();
            
            invoke(
                &initialize_mint(&token_program_id, &mint_account_info.key,  &mint_authority_pubkey, Some(&freeze_authority_pubkey), decimals)?,
                &[mint_account_info.clone(), rent_account_info.clone()]
            )?;
            

            invoke(
                &initialize_account2(&token_program_id, &associated_account_info.key, &mint_account_info.key, &payer_account_info.key)?,
                &[associated_account_info.clone(),
                mint_account_info.clone(),
                payer_account_info.clone(),
                rent_account_info.clone(),
                ]
            )?;

            invoke(
                &mint_to(&token_program_id, &mint_account_info.key, &associated_account_info.key, &payer_account_info.key, &[/*Now Cyrial go and hunt what this signers are*/], 1)?,
                &[mint_account_info.clone(),
                associated_account_info.clone(),
                payer_account_info.clone()]
            )?;

            invoke(
                &set_authority(&token_program_id, &mint_account_info.key, Some(&program_id), AuthorityType::FreezeAccount, &program_id, &[])?,
                &[
                    mint_account_info.clone(),
                    program_id_account_info.clone()
                ]
            )?;
            



        }
    }
    

    Ok(())
}

#[cfg(test)]
mod tests {
    // use std::str::FromStr;

    // use solana_program::pubkey::Pubkey;

    #[test]
    fn it_works() {
        // let mut x: Option<&Pubkey> = Some(&Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap());
        assert_eq!(5*5, 5*5);
    }
}