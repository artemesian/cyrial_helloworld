use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    msg,
    // clock::Clock,
    pubkey::Pubkey,
    program_error::ProgramError,
    system_instruction,
    sysvar::{rent::Rent, Sysvar}, borsh::try_from_slice_unchecked,
};
use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};
use spl_token::instruction::*;


use metaplex_token_metadata::{id, state::{Metadata}};

entrypoint!(process_instructions);



#[derive(BorshSerialize, BorshDeserialize)]
enum TokenType{
    Sol,
    Dsol
}
enum InstructionEnum{
    CreateCollection{rentable: bool, token_type: TokenType},
    CreateLimitOrder{
        price: u32
    },
    CloseLimitOrder{current_bump: u64},
    FillLimitOrder{current_bump: u64},
}



#[derive(BorshSerialize, BorshDeserialize)]
struct CollectionData{
    address: [u8;32],
    min_listed: u32,
    max_listed: u32,
    max_ever: u32,
    rentable: bool,
    rent_min_listed: u32,
    rent_max_listed: u32,
    rent_max_ever: u32,
    token_type: TokenType
}




#[derive(BorshSerialize, BorshDeserialize)]
struct ContainerData{
    collection_address: [u8;32],
    mint_address: [u8;32],
    price: u32,
    owner: Pubkey,
    state: bool,
}


fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}

impl InstructionEnum{
    fn decode_instruction(data: &[u8]) -> Result<Self, ProgramError> {
       Ok(match data[0]{
            0 => {
                Self::CreateCollection{rentable: if data[1] == 1 {true} else {false}, token_type: match data[2]{ 0 => {TokenType::Sol} 1=> {TokenType::Dsol} _ => Err(ProgramError::Custom(121))? }}
            }
            1 => {
                let price = ((get_num_cnt(&data[0..3]) as f32  + (get_num_cnt(&data[3..6]) as f32) / 10000.0) * 10e9) as u32; // maximum price it can be listed is = 65286.5280
                Self::CreateLimitOrder{price:price}
            }
            2 => {
                //Send the token from the pda to the owner. Then send the token from the max_listed drawer into the current_pda, and decrementing max_listed value updating the data as needed
                let current_bump = get_num_cnt(&data[1..4]) as u64 * get_num_cnt(&data[4..7]) as u64 + get_num_cnt(&data[7..10]) as u64;
                Self::CloseLimitOrder{current_bump}
            }
            3 => {
                //collect the price of the NFT first, send it to the owner - the royalty, shared with the relevant authorities, Then Send the token from the pda to the payer. Then send the token from the max_listed drawer into the current_pda, and decrementing max_listed value updating the data as needed
                let current_bump = get_num_cnt(&data[1..4]) as u64 * get_num_cnt(&data[4..7]) as u64 + get_num_cnt(&data[7..10]) as u64;
                Self::FillLimitOrder{current_bump}
            }
            _ => Err(ProgramError::InvalidInstructionData)?
        })

    }
}

fn create_collection(program_id: &Pubkey, accounts: &[AccountInfo], rentable: bool, token_type: TokenType) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?; 
    let creator_account_info = next_account_info(account_info_iter)?; // Account_infos of a signed Creator
    let collection_pda_info = next_account_info(account_info_iter)?; // Account where collection data will be stored

    let (collection_pda, collection_pda_bump) = Pubkey::find_program_address(&[b"Gamestree_seed", &creator_account_info.key.to_bytes()], program_id);

    if collection_pda != *collection_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    let space = 50;
    let lamports = Rent::get()?.minimum_balance(space as usize);

    invoke_signed(
        &system_instruction::create_account(&payer_account_info.key, &collection_pda, lamports, space, &program_id),
        &[payer_account_info.clone(), collection_pda_info.clone()],
        &[&[b"Gamestree_seed", &creator_account_info.key.to_bytes(), &[collection_pda_bump]]]
    )?;
    let collection_data = CollectionData{
        address: creator_account_info.key.to_bytes(),
        min_listed: 0,
        max_listed: 0,
        max_ever: 0,
        rentable: rentable,
        rent_min_listed: 0,
        rent_max_listed: 0,
        rent_max_ever: 0,
        token_type: token_type
    };

    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn create_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], price: u32) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let creator_account_info = next_account_info(account_info_iter)?;
    let collection_pda_info = next_account_info(account_info_iter)?;
    let container_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let container_associated_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let current_associated_account_info = next_account_info(account_info_iter)?;
    let metadata_account_info = next_account_info(account_info_iter)?;

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;

    let collection_unique_bump = collection_data.max_listed;
    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    if collection_data.max_listed == collection_data.max_ever{
        collection_data.max_ever +=  1;
        let space = 50;
        let lamports = Rent::get()?.minimum_balance(space as usize);
        invoke_signed(
            &system_instruction::create_account(&payer_account_info.key, &container_pda, lamports, space, &program_id),
            &[payer_account_info.clone(), container_account_info.clone()],
            &[container_seed]
        )?;
    }
    else{
        let current_container_data: ContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;
        if current_container_data.state == true{
            msg!("current Container doesn't seem to be Empty, Big Problem");
            Err(ProgramError::Custom(1))?
        }
    }
    let new_container_data = ContainerData{
        collection_address: creator_account_info.key.to_bytes(),
        mint_address: mint_account_info.key.to_bytes(),
        price: price,
        owner: *payer_account_info.key,
        state: true
    };

    new_container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;
    

    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let metadata = Metadata::from_account_info(metadata_account_info)?;

    match metadata.data.creators{
        Some(creators) =>{
            for creator in creators.iter(){
                if &creator.address == creator_account_info.key{
                    if creator.verified{
                        break;
                    }
                    else{
                        msg!("NFT, Not signed by Creator");
                        Err(ProgramError::InvalidAccountData)?
                    }
                }
            }
            msg!("NFT, Wrong Creator in Account Sent");
            Err(ProgramError::InvalidAccountData)?
        }
        None => {msg!("Cannot Certify Authenticity of this NFT"); Err(ProgramError::InvalidAccountData)?}
    }

    if *container_associated_account_info.key != get_associated_token_address(container_account_info.key, mint_account_info.key){
        Err(ProgramError::Custom(1))?
    }

    invoke(
        &create_associated_token_account(
            payer_account_info.key,
            container_account_info.key,
            mint_account_info.key,
        ),
        &[
            payer_account_info.clone(),
            container_associated_account_info.clone(),
            container_account_info.clone(),
            mint_account_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ],
    )?;

    invoke(
        &transfer(token_program_info.key, current_associated_account_info.key, container_associated_account_info.key, payer_account_info.key, &[], 1)?, //don't know what authority_pubkey is, it could be mint_authority, but I am not sure
        &[
            current_associated_account_info.clone(),
            container_associated_account_info.clone(),
            payer_account_info.clone(),
        ]
    )?;
    collection_data.max_listed += 1;

    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;
    Ok(())
}

fn close_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], current_bump:u64) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let max_container_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let container_account_info = next_account_info(account_info_iter)?;
    let collection_pda_info = next_account_info(account_info_iter)?;
    let creator_account_info = next_account_info(account_info_iter)?;
    let payer_associated_account_info = next_account_info(account_info_iter)?;
    let container_associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }

    

    let collection_unique_bump = current_bump;
    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut container_data: ContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;
    if !container_data.state || container_data.owner != *payer_account_info.key{
        Err(ProgramError::Custom(1))?
    }

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;
    let collection_unique_bump = collection_data.max_listed;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &collection_account_info.key.to_bytes(), &[container_pda_bump]];

    if *max_container_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    container_data = try_from_slice_unchecked(&max_container_info.data.borrow())?;

    container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;

    if *container_associated_account_info.key != get_associated_token_address(container_account_info.key, mint_account_info.key){
        Err(ProgramError::Custom(2))?
    }

    invoke_signed(
        &transfer(token_program_info.key, container_associated_account_info.key, payer_associated_account_info.key, container_account_info.key, &[], 1)?, //don't know what authority_pubkey is, it could be mint_authority, but I am not sure. used current owner, because of line 268 of spl_program/processor.rs
        &[
            container_associated_account_info.clone(),
            payer_associated_account_info.clone(),
            container_account_info.clone(),
        ],
        &[container_seed]
    )?;



    collection_data.max_listed -= 1;
    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn fill_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], current_bump:u64) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let max_container_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let container_account_info = next_account_info(account_info_iter)?;
    let collection_pda_info = next_account_info(account_info_iter)?;
    let creator_account_info = next_account_info(account_info_iter)?;
    let payer_associated_account_info = next_account_info(account_info_iter)?;
    let container_associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let owner_account_info = next_account_info(account_info_iter)?;
    let payer_dsol_token_account_info = next_account_info(account_info_iter)?;
    let owner_dsol_token_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }

    

    let collection_unique_bump = current_bump;
    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut container_data: ContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;
    if !container_data.state{
        Err(ProgramError::Custom(1))?
    }

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;
    let collection_unique_bump = collection_data.max_listed;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &creator_account_info.key.to_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Gamestree_seed", &collection_unique_bump.to_be_bytes(), &collection_account_info.key.to_bytes(), &[container_pda_bump]];

    if *max_container_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    match collection_data.token_type {
        TokenType::Sol => {invoke(
            &system_instruction::transfer(payer_account_info.key, &container_data.owner, container_data.price as u64),
            &[payer_account_info.clone(), owner_account_info.clone()]
        )?;
        }
        TokenType::Dsol => {
            msg!("Transfer DSOL token");
            invoke(
                &spl_token::instruction::transfer(
                    &token_program_info.key,
                    &payer_dsol_token_account_info.key,
                    &owner_dsol_token_account_info.key,
                    &payer_account_info.key,
                    &[],
                    (container_data.price as f32 /10.0) as u64
                )?,
                &[payer_dsol_token_account_info.clone(), owner_dsol_token_account_info.clone(), payer_account_info.clone()]
            )?;
        }
    }
  
    container_data = try_from_slice_unchecked(&max_container_info.data.borrow())?;

    container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;

    if *container_associated_account_info.key != get_associated_token_address(container_account_info.key, mint_account_info.key){
        Err(ProgramError::Custom(2))?
    }

    invoke_signed(
        &transfer(token_program_info.key, container_associated_account_info.key, payer_associated_account_info.key, container_account_info.key, &[], 1)?, //don't know what authority_pubkey is, it could be mint_authority, but I am not sure. used current owner, because of line 268 of spl_program/processor.rs
        &[
            container_associated_account_info.clone(),
            payer_associated_account_info.clone(),
            container_account_info.clone(),
        ],
        &[container_seed]
    )?;



    collection_data.max_listed -= 1;
    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult{
    let instruction  = InstructionEnum::decode_instruction(instruction_data)?;
 
    match instruction{
        InstructionEnum::CreateCollection{rentable, token_type} => {
           create_collection(program_id, accounts, rentable, token_type)?
        }
        InstructionEnum::CreateLimitOrder{price} => {
            if price > 65000{
                Err(ProgramError::InvalidInstructionData)?
            }
            create_limit_order(program_id, accounts, price)?
        }
        InstructionEnum::CloseLimitOrder{current_bump} => {
            close_limit_order(program_id, accounts, current_bump)?
        }
        InstructionEnum::FillLimitOrder{current_bump} => {
            fill_limit_order(program_id, accounts, current_bump)?
        }
        // _ => Err(ProgramError::InvalidInstructionData)?
    }


    Ok(())
}






// #[cfg(test)]
// mod tests {
//     #[test]
//     fn it_works() {
//         let result = 2 + 2;
//         assert_eq!(result, 4);
//     }
// }
