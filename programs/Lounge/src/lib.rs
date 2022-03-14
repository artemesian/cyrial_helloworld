use borsh::{BorshDeserialize, BorshSerialize};
// use metaplex_token_metadata::{id, state::Metadata};
use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    instruction::{Instruction, AccountMeta},
    msg,
    borsh::try_from_slice_unchecked, program::invoke_signed, program_pack::Pack, system_instruction, rent::Rent, sysvar::Sysvar,
};

extern crate global_repo;
use global_repo::{error::GlobalError,
    instruction_enums::TableInstructionEnum,
};


use spl_associated_token_account::{get_associated_token_address};
use spl_token::state::Account;
enum InstructionEnum{
    AddToLounge,
    RemoveFromLounge,
    CreateLoungeAccount,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Lounge{
    all_tables: Vec<[u8;32]>
}

#[derive(BorshSerialize, BorshDeserialize)]
struct TableData{
    date_created: u32,
    id: u32,
    rarity: u8,
    creators:  Vec<[u8; 32]>,
    num_creators: u8,
    governor_reward: u32, 
    minted: bool,
    is_on_lobby: bool,
}


impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<InstructionEnum, ProgramError> {
        match data[0]{
            0 => {Ok(Self::AddToLounge)}
            1 => {Ok(Self::RemoveFromLounge)}
            3 => {Ok(Self::CreateLoungeAccount)}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}


entrypoint!(process_instructions);

fn add_to_lounge(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let table_mint_account_info = next_account_info(account_info_iter)?;
    let table_associated_account_info = next_account_info(account_info_iter)?;
    let table_mint_authority_info = next_account_info(account_info_iter)?;
    let table_data_pda_info = next_account_info(account_info_iter)?;
    let lounge_info = next_account_info(account_info_iter)?;
    let authorizer_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer{
        msg!("Payer is not signer");
        Err(GlobalError::InvalidSignature)?
    }
    
    
    let (authorizer_pda, authorizer_pda_bump) = Pubkey::find_program_address(&[b"authorizer_pda"], program_id);
    let authorizer_signers_seeds: &[&[u8]; 2] = &[b"authorizer_pda", &[authorizer_pda_bump]];
    if &authorizer_pda != authorizer_account_info.key {
        msg!("authorizers do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    

    let (lounge_pda, _lounge_bump) = Pubkey::find_program_address(&[b"Tables_Lounge"], program_id);
    if lounge_pda != *lounge_info.key {
        msg!("Lounge pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut lounge_data: Lounge = try_from_slice_unchecked(&lounge_info.data.borrow())?;
    


    let (table_data_pda, _table_data_bump)  = Pubkey::find_program_address(&[b"table_data_pda", &table_mint_account_info.key.to_bytes()], &global_repo::table::id());

    if table_data_pda != *table_data_pda_info.key {
        msg!("table data pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    msg!("right before table data deserialization");
    let table_data: TableData = try_from_slice_unchecked(&table_data_pda_info.data.borrow())?;

    if table_data.is_on_lobby{
        msg!("table data indicates table is already on the lobby, an issue stems there");
        Err(ProgramError::InvalidAccountData)?
    }

    let t_associated_key = get_associated_token_address(payer_account_info.key, table_mint_account_info.key);

    if t_associated_key != *table_associated_account_info.key {
        msg!("table associated_token_accounts do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let table_assoc_data = Account::unpack(&table_associated_account_info.data.borrow())?;
    if table_assoc_data.amount != 1{
        msg!("The balance of the associated token account doesn't match 1, which is expected");
        Err(ProgramError::InvalidAccountData)?
    }

    if table_assoc_data.is_frozen(){
        msg!("Table seem to already be frozen, Can't be utilized in the present conditions");
        Err(ProgramError::InvalidAccountData)?
    }

    lounge_data.all_tables.retain(|x| *x != table_mint_account_info.key.to_bytes());

    lounge_data.all_tables.push(table_mint_account_info.key.to_bytes());
    msg!("right before lounge data serialization");
    lounge_data.serialize(&mut &mut lounge_info.data.borrow_mut()[..])?;

    let account_metas = vec![
            // AccountMeta::new_readonly(*payer_account_info.key, true),
            AccountMeta::new_readonly(authorizer_pda, true),
            AccountMeta::new_readonly(*table_mint_account_info.key, false),
            AccountMeta::new_readonly(*table_mint_authority_info.key, false),
            AccountMeta::new(*table_associated_account_info.key, false),
            AccountMeta::new_readonly(*token_program_info.key, false),
            AccountMeta::new(*table_data_pda_info.key, false),


            AccountMeta::new_readonly(*token_program_info.key, false),
        ];

    // let new_data = TableInstructionEnum::LockTable.try_to_vec().unwrap();
    msg!("right before table instruction for freze account");

    invoke_signed(
        &Instruction::new_with_borsh(
            global_repo::table::id(),
            &TableInstructionEnum::LockTable,
            account_metas,
        ),
        &[
            // payer_account_info.clone(),
            authorizer_account_info.clone(),
            table_mint_account_info.clone(),
            table_mint_authority_info.clone(),
            table_associated_account_info.clone(),
            token_program_info.clone(),
            table_data_pda_info.clone(),


            token_program_info.clone(),
        ],
        &[authorizer_signers_seeds],

    )?;

    Ok(())
}

fn remove_from_lounge(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let table_mint_account_info = next_account_info(account_info_iter)?;
    let table_associated_account_info = next_account_info(account_info_iter)?;
    let table_mint_authority_info = next_account_info(account_info_iter)?;
    let table_data_pda_info = next_account_info(account_info_iter)?;
    let lounge_info = next_account_info(account_info_iter)?;
    let authorizer_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer{
        msg!("Payer is not signer");
        Err(GlobalError::InvalidSignature)?
    }
    
    
    let (authorizer_pda, authorizer_pda_bump) = Pubkey::find_program_address(&[b"authorizer_pda"], program_id);
    let authorizer_signers_seeds: &[&[u8]; 2] = &[b"authorizer_pda", &[authorizer_pda_bump]];
    if &authorizer_pda != authorizer_account_info.key {
        msg!("authorizers do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    

    let (lounge_pda, _lounge_bump) = Pubkey::find_program_address(&[b"Tables_Lounge"], program_id);
    if lounge_pda != *lounge_info.key {
        msg!("Lounge pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut lounge_data: Lounge = try_from_slice_unchecked(&lounge_info.data.borrow())?;
    


    let (table_data_pda, _table_data_bump)  = Pubkey::find_program_address(&[b"table_data_pda", &table_mint_account_info.key.to_bytes()], &global_repo::table::id());

    if table_data_pda != *table_data_pda_info.key {
        msg!("table data pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let table_data: TableData = try_from_slice_unchecked(&table_data_pda_info.data.borrow())?;

    if !table_data.is_on_lobby{
        msg!("table data indicates table is not on the lobby, an issue stems there");
        Err(ProgramError::InvalidAccountData)?
    }

    let t_associated_key = get_associated_token_address(payer_account_info.key, table_mint_account_info.key);

    if t_associated_key != *table_associated_account_info.key {
        msg!("table associated_token_accounts do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let table_assoc_data = Account::unpack(&table_associated_account_info.data.borrow())?;
    if table_assoc_data.amount != 1{
        msg!("The balance of the associated token account doesn't match 1, which is not expected");
        Err(ProgramError::InvalidAccountData)?
    }

    // if !table_assoc_data.is_frozen(){
    //     msg!("Table seem to already be frozen, Can't be utilized in the present conditions");
    //     Err(ProgramError::InvalidAccountData)?
    // }

    lounge_data.all_tables.retain(|x| *x != table_mint_account_info.key.to_bytes());

    lounge_data.serialize(&mut &mut lounge_info.data.borrow_mut()[..])?;

    let account_metas = vec![
            // AccountMeta::new_readonly(*payer_account_info.key, true),
            AccountMeta::new_readonly(authorizer_pda, true),
            AccountMeta::new_readonly(*table_mint_account_info.key, false),
            AccountMeta::new_readonly(*table_mint_authority_info.key, false),
            AccountMeta::new(*table_associated_account_info.key, false),
            AccountMeta::new_readonly(*token_program_info.key, false),
            AccountMeta::new(*table_data_pda_info.key, false),


            AccountMeta::new_readonly(*token_program_info.key, false),
        ];


    invoke_signed(
        &Instruction::new_with_bincode(
            global_repo::table::id(),
            &TableInstructionEnum::UnlockTable,
            account_metas,
        ),
        &[
            // payer_account_info.clone(),
            authorizer_account_info.clone(),
            table_mint_account_info.clone(),
            table_mint_authority_info.clone(),
            table_associated_account_info.clone(),
            token_program_info.clone(),
            table_data_pda_info.clone(),


            token_program_info.clone(),
        ],
        &[authorizer_signers_seeds],

    )?;

    Ok(())
}


fn create_lounge_account(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{


    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let lounge_info = next_account_info(account_info_iter)?;


    let (lounge_pda, lounge_bump) = Pubkey::find_program_address(&[b"Tables_Lounge"], program_id);

    if &lounge_pda != lounge_info.key{
        Err(ProgramError::InvalidAccountData)?
    }



    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &lounge_info.key,
            Rent::get()?.minimum_balance(8000),
            8000,
            &program_id,
        ),
        &[payer_account_info.clone(), lounge_info.clone()],
        &[
            &[        
                b"Tables_Lounge",
                &[lounge_bump]
                ]
                ]
    )?;

    let lounge_data = Lounge{
        all_tables: Vec::new()
    };

    lounge_data.serialize(&mut &mut lounge_info.data.borrow_mut()[..])?;


    Ok(())
}

fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult{
    let instruction = InstructionEnum::decode(instruction_data)?;
    match instruction {
        InstructionEnum::AddToLounge => {add_to_lounge(program_id, accounts)?}
        InstructionEnum::RemoveFromLounge => {remove_from_lounge(program_id, accounts)?}
        InstructionEnum::CreateLoungeAccount => {create_lounge_account(program_id, accounts)?}
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
