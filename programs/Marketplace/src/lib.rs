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

extern crate global_repo;
use global_repo::error::GlobalError;


use metaplex_token_metadata::{id, state::{Metadata}};

entrypoint!(process_instructions);



#[derive(BorshSerialize, BorshDeserialize)]
enum TokenType{
    Sol,
    Dsol
}
enum InstructionEnum{
    CreateCollection{token_type: TokenType},
    CreateLimitOrder{
        price: u64,
    },
    CloseLimitOrder{current_bump: u32},
    FillLimitOrder{current_bump: u32},
    CreatePayerCollection,
}


#[derive(BorshSerialize, BorshDeserialize, Clone, Copy)]
struct Listing {
    payer: [u8;32],
    collection: [u8;32],
    bump: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct CollectionData{
    address: [u8;32],
    all_listings: Vec<Listing>,
    token_type: TokenType
}

#[derive(BorshSerialize, BorshDeserialize)]
struct PayerCollection{
    address: [u8;32],
    all_listings: Vec<Listing>,
    id: u32,
}


#[derive(BorshSerialize, BorshDeserialize)]
struct ContainerData{
    collection_address: [u8;32],
    mint_address: [u8;32],
    price: u64,
    owner: [u8;32],
    is_used: bool,
}



fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}

impl InstructionEnum{
    fn decode_instruction(data: &[u8]) -> Result<Self, ProgramError> {
       Ok(match data[0]{
            0 => {
                Self::CreateCollection{token_type: match data[1]{ 0 => {TokenType::Sol} 1=> {TokenType::Dsol} _ => Err(ProgramError::Custom(121))? }}
            }
            1 => {
                let price = ((get_num_cnt(&data[1..4]) as f32  + (get_num_cnt(&data[4..7]) as f32) / 1000.0) * 10e9) as u64; // maximum price it can be listed is = 65286.5280

                if price as f64 > 65000.0 * 10e9{
                    msg!("Listing price is greater than tolerable");
                    Err(ProgramError::InvalidInstructionData)?
                }

                Self::CreateLimitOrder{price:price}
            }
            2 => {
                //Send the token from the pda to the owner. Then send the token from the max_listed drawer into the current_pda, and decrementing max_listed value updating the data as needed
                let current_bump = get_num_cnt(&data[1..4]);
                Self::CloseLimitOrder{current_bump}
            }
            3 => {
                //collect the price of the NFT first, send it to the owner - the royalty, shared with the relevant authorities, Then Send the token from the pda to the payer. Then send the token from the max_listed drawer into the current_pda, and decrementing max_listed value updating the data as needed
                let current_bump = get_num_cnt(&data[1..4]);
                Self::FillLimitOrder{current_bump}
            }
            4 => {Self::CreatePayerCollection}
            _ => Err(ProgramError::InvalidInstructionData)?
        })

    }
}

fn create_collection(program_id: &Pubkey, accounts: &[AccountInfo],token_type: TokenType) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?; 
    let creator_account_info = next_account_info(account_info_iter)?; // Account_infos of a signed Creator
    let collection_pda_info = next_account_info(account_info_iter)?; // Account where collection data will be stored

    let (collection_pda, collection_pda_bump) = Pubkey::find_program_address(&[b"Dsol Dao_seed", &creator_account_info.key.to_bytes()], program_id);

    if collection_pda != *collection_pda_info.key{
        msg!("collection pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    let space = 8000;
    let lamports = Rent::get()?.minimum_balance(space as usize);

    invoke_signed(
        &system_instruction::create_account(&payer_account_info.key, &collection_pda, lamports, space, &program_id),
        &[payer_account_info.clone(), collection_pda_info.clone()],
        &[&[b"Dsol Dao_seed", &creator_account_info.key.to_bytes(), &[collection_pda_bump]]]
    )?;
    let collection_data = CollectionData{
        address: creator_account_info.key.to_bytes(),
        all_listings: Vec::new(),
        token_type: token_type
    };

    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn create_payer_collection(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?; 
    let creator_account_info = next_account_info(account_info_iter)?; // Account_infos of a signed Creator
    let payer_collection_info = next_account_info(account_info_iter)?; // Account where collection data will be stored

    let (payer_collection_pda, collection_pda_bump) =  Pubkey::find_program_address(&[b"payer_collection_dsol", &payer_account_info.key.to_bytes(), &creator_account_info.key.to_bytes()], program_id);
    if payer_collection_pda != *payer_collection_info.key{
        msg!("payer collection pdas do not match {:?} <-----> {:?}", *payer_collection_info.key, payer_collection_pda);
        Err(GlobalError::KeypairNotEqual)?
    }
    let space = 2000;
    let lamports = Rent::get()?.minimum_balance(space as usize);

    invoke_signed(
        &system_instruction::create_account(&payer_account_info.key, &payer_collection_pda, lamports, space, &program_id),
        &[payer_account_info.clone(), payer_collection_info.clone()],
        &[&[b"payer_collection_dsol", &payer_account_info.key.to_bytes(), &creator_account_info.key.to_bytes(), &[collection_pda_bump]]]
    )?;
    let collection_data = PayerCollection{
        address: creator_account_info.key.to_bytes(),
        all_listings: Vec::new(),
        id: 0,
    };

    collection_data.serialize(&mut &mut payer_collection_info.data.borrow_mut()[..])?;

    Ok(())
}

fn create_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], price: u64) -> ProgramResult{

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
    let payer_collection_info = next_account_info(account_info_iter)?;

    let (payer_collection_pda, _) =   Pubkey::find_program_address(&[b"payer_collection_dsol", &payer_account_info.key.to_bytes(), &creator_account_info.key.to_bytes()], program_id);
    if payer_collection_pda != *payer_collection_info.key{
        msg!("payer collection pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut payer_collection_data: PayerCollection = try_from_slice_unchecked(&payer_collection_info.data.borrow())?;
    let bump = payer_collection_data.id;

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;

    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        msg!("container info pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let space = 200;
    let lamports = Rent::get()?.minimum_balance(space as usize);
    invoke_signed(
        &system_instruction::create_account(&payer_account_info.key, &container_pda, lamports, space, &program_id),
        &[payer_account_info.clone(), container_account_info.clone()],
        &[container_seed]
    )?;

    let new_container_data = ContainerData{
        collection_address: creator_account_info.key.to_bytes(),
        mint_address: mint_account_info.key.to_bytes(),
        price: price,
        owner: payer_account_info.key.to_bytes(),
        is_used: true
    };

    new_container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;
    

    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        msg!("Metadata pdas don't match");
        Err(ProgramError::InvalidAccountData)?
    }

    let metadata = Metadata::from_account_info(metadata_account_info)?;

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

    if *container_associated_account_info.key != get_associated_token_address(container_account_info.key, mint_account_info.key){
        msg!("container associated account infos don't match");
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
        &transfer(token_program_info.key, current_associated_account_info.key, container_associated_account_info.key, payer_account_info.key, &[], 1)?,
        &[
            current_associated_account_info.clone(),
            container_associated_account_info.clone(),
            payer_account_info.clone(),
        ]
    )?;

    let listing = Listing{
        payer: payer_account_info.key.to_bytes(),
        collection: creator_account_info.key.to_bytes(),
        bump: bump
    };
    collection_data.all_listings.push(listing.clone());
    payer_collection_data.all_listings.push(listing.clone());
    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;
    payer_collection_data.serialize(&mut &mut payer_collection_info.data.borrow_mut()[..])?;



    Ok(())
}

fn close_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], bump:u32) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    // let max_container_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let container_account_info = next_account_info(account_info_iter)?;
    let collection_pda_info = next_account_info(account_info_iter)?;
    let creator_account_info = next_account_info(account_info_iter)?;
    let payer_associated_account_info = next_account_info(account_info_iter)?;
    let container_associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let payer_collection_info = next_account_info(account_info_iter)?;


    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }
    let (payer_collection_pda, _) =   Pubkey::find_program_address(&[b"payer_collection_dsol", &payer_account_info.key.to_bytes(), &creator_account_info.key.to_bytes()], program_id);
    if payer_collection_pda != *payer_collection_info.key{
        msg!("payer collection pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut payer_collection_data: PayerCollection = try_from_slice_unchecked(&payer_collection_info.data.borrow())?;

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;

    if !payer_account_info.is_signer{
        msg!("Payer is not signer");
        Err(ProgramError::InvalidAccountData)?
    }  

    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        msg!("container pda mismatch");
        Err(ProgramError::InvalidAccountData)?
    }

    let mut container_data: ContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;
    if !container_data.is_used || container_data.owner != payer_account_info.key.to_bytes(){
        msg!("container is not being used, or payer is not container owner");
        Err(ProgramError::Custom(1))?
    }
    container_data.is_used = false;
    // container_data = try_from_slice_unchecked(&max_container_info.data.borrow())?;


    if *container_associated_account_info.key != get_associated_token_address(container_account_info.key, mint_account_info.key){
        msg!("container associated account infos do not match");
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

    collection_data.all_listings.remove( collection_data.all_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.collection == creator_account_info.key.to_bytes() && x.bump == bump).expect("failed to remove collection listings"));
    payer_collection_data.all_listings.remove(payer_collection_data.all_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.collection == creator_account_info.key.to_bytes() && x.bump == bump).expect("failed to remove payer_collection listings"));
    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;
    payer_collection_data.serialize( &mut &mut payer_collection_info.data.borrow_mut()[..])?;
    container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;
    Ok(())
}

fn fill_limit_order(program_id: &Pubkey, accounts: &[AccountInfo], bump:u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    // let max_container_info = next_account_info(account_info_iter)?;
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
    let payer_collection_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }

    
    let (payer_collection_pda, _) =  Pubkey::find_program_address(&[b"payer_collection_dsol", &payer_account_info.key.to_bytes(), &creator_account_info.key.to_bytes()], program_id);
    if payer_collection_pda != *payer_collection_info.key{
        msg!("payer collection pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut payer_collection_data: PayerCollection = try_from_slice_unchecked(&payer_collection_info.data.borrow())?;

    let mut collection_data: CollectionData = try_from_slice_unchecked(&collection_pda_info.data.borrow())?;

    if !payer_account_info.is_signer{
        msg!("Payer is not signer");
        Err(ProgramError::InvalidAccountData)?
    }  

    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Dsol Dao_seed", &bump.to_be_bytes(), &creator_account_info.key.to_bytes(), &payer_account_info.key.to_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        msg!("container pda mismatch");
        Err(ProgramError::InvalidAccountData)?
    }

    let mut container_data: ContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;

    match collection_data.token_type {
        TokenType::Sol => {invoke(
            &system_instruction::transfer(payer_account_info.key, &Pubkey::new(&container_data.owner), container_data.price as u64),
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
    container_data.is_used = false;


    collection_data.all_listings.remove( collection_data.all_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.collection == creator_account_info.key.to_bytes() && x.bump == bump).expect("failed to remove collection listings"));
    payer_collection_data.all_listings.remove(payer_collection_data.all_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.collection == creator_account_info.key.to_bytes() && x.bump == bump).expect("failed to remove payer_collection listings"));
    collection_data.serialize(&mut &mut collection_pda_info.data.borrow_mut()[..])?;
    payer_collection_data.serialize( &mut &mut payer_collection_info.data.borrow_mut()[..])?;
    container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;
    Ok(())
}

fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult{
    let instruction  = InstructionEnum::decode_instruction(instruction_data)?;
 
    match instruction{
        InstructionEnum::CreateCollection{token_type} => {
           create_collection(program_id, accounts, token_type)?
        }
        InstructionEnum::CreateLimitOrder{price} => {
            create_limit_order(program_id, accounts, price)?
        }
        InstructionEnum::CloseLimitOrder{current_bump} => {
            close_limit_order(program_id, accounts, current_bump)?
        }
        InstructionEnum::FillLimitOrder{current_bump} => {
            fill_limit_order(program_id, accounts, current_bump)?
        }
        InstructionEnum::CreatePayerCollection =>{
            create_payer_collection(program_id, accounts)?
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
