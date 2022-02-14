use borsh::{BorshDeserialize, BorshSerialize};
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
    program_error::ProgramError,
};
use spl_associated_token_account::create_associated_token_account;
use spl_token::instruction::*;
use metaplex_token_metadata::{instruction, id, state::{Creator}};

// use solana_sdk::{borsh::try_from_slice_unchecked};
use std::str::FromStr;
entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Sales{
    pub vault_total: f32,
    pub counter: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AvatarData{// Find out how to use the clock on solana
    pub date_created: u32,
    pub unlockable_date: u32,
    pub level: u8,
    pub xp: u32,
}

pub fn lock_time(counter:f32)->u32{
    let mut e_power:f32  = (80000.0 - counter) / 50000.0;
    e_power = e_power.powf(5.0);
    e_power = 1.0 + std::f32::consts::E.powf(e_power);
    (365.0 * 8640.0 / e_power) as u32
}



fn select_uri<'life>(ind: u32) -> &'life str {

    let new_ind = ind % 1000;

    //Champion
    if new_ind == 689{
        let avatars = ["https://arweave.net/zREGv-Dt7Pw_CqvumRBvrGGTNg8-9EE6kQa-zcIpouM",
        "https://arweave.net/tKPxIsiTOBdczp6InMu_IC_kFSlCYHu4O6ZOKAPBiUA",
        "https://arweave.net/gV3tRlZFOgcOLcQeYOcnqlSt7iJvoaGNXobQtVL-wgw",
        "https://arweave.net/x5odbWE6nrqsdpDsxhjLCwKMudeXbb0N39DY66iKotQ"];
        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //Proffesional
    else if new_ind >= 432 && new_ind <442 {
        let avatars =  ["https://arweave.net/MmZN9UVtvP4wtDsb9AvtzJvzK1SrcRztLpbh9eJ6kKQ",
        "https://arweave.net/91uxMH8i8BN4n9XAL8mPpDZzAjiB7GJsDwSDfseYAHw",
        "https://arweave.net/11c3DZfiuE42ehWnZbRb7rmXSvRg6rvf7rVEFI9SxAo",
        "https://arweave.net/lflC2tkF7SCZ8OJ28j4UuLvpYXeQdMLlTjSiBoLgnYg",
        "https://arweave.net/LIKg4VDR-vTMFokQAyKtMd5XptfKdWOorxpS3L3K0Y8",
        "https://arweave.net/bA_pt6mcI3z93I2cgF16PR8TQe6drSJjZd-RmVt_OVA"];

        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //Rookie
    else if new_ind >= 600 && new_ind < 634{
        let avatars =  ["https://arweave.net/L7_O0J0tw4Wi95bqFV9PY72RxCQ-Chr0glA0UJywALE",
        "https://arweave.net/rA-YamVx4a5gTkx55s9b1rEG4s6WkwXfweISGhW3DMY",
        "https://arweave.net/6A68qFPCJR7UL6_095zHAKufdrq3hMq4ctD1Rz68QL8",
        "https://arweave.net/kvjMKHfqritvkPKUF1GWpcReO6XTCeQ45a0-WcGQlgM",
        "https://arweave.net/QiwFzMBy3wK06C6leOqRMIgKxrn-cZB8bbpxPJbopgY",
        "https://arweave.net/fVH3Mamk7xQCEOkKjEwwyW7K_W7XG88rDFBan42u7uk"];

        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //Amature
    else if new_ind >= 545 && new_ind < 600{
        let avatars = ["https://arweave.net/Vp0TmR-V9-KveOrPDTkSJZr1-sixgMTMpkX6md0b7_o",
        "https://arweave.net/uuiJD7ZkuQLK2raBUMHrxn2bej-jQaleWBylWmU9-c8",
        "https://arweave.net/jgZN-q6a0pAaK7csoohurm-zHq54AP8LRHw3PcLDBq0",
        "https://arweave.net/Se6q3t37ecQi-qjMY4J_Zkgair6tpeUXREBncIG1uiY",
        "https://arweave.net/ht4duIHkYFqEzOdkUyrUHyTBQJPyBfK8dGmUtWCCmv4",
        "https://arweave.net/Xa42ocgmuaGjCbKh_z4uqoflJ203w8mLG1u7cshqoUQ"];

        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //Local
    else if new_ind < 100{
        let avatars =  ["https://arweave.net/kpQ38aRBSdtbwdKn61v626YSBMLR0JGGMXkRWBip_dQ",
        "https://arweave.net/7cN_ghHZlRf30N61Eh2do5h2K-xRGnHjyKrsCTkhec4",
        "https://arweave.net/rKmeBpwN3DXwBrG6QqSxU30EHNOdXjUebPj0Xl-rCgA",
        "https://arweave.net/zapAnS4W3gLO-6m_zEI3HNUEfTfzOLe51b5sm4FGwNg",
        "https://arweave.net/Yy3wG4UDpeBCHGr6s9FKQOl6x0zjo_jHjmWP1I6Hcbw",
        "https://arweave.net/6eo3M2V9tP-xkPQ9S0RRp4cnRcddGXYCs_yKAEXs3Mc",
        "https://arweave.net/IEsRi8tuErw0NpxQ6_wZXo7knPjuS9aRe8HwwPsPzRc",
        "https://arweave.net/JsQ5_kCISftFJr4A0GhY0MavKY6-nYjn2WNAo_-jq_M"];
        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //Casual
    else if new_ind > 800{
        let avatars = ["https://arweave.net/tch0HhWhGM_nasO1UhN0l2LcTfbxv6H4ErmaXtguGZQ",
        "https://arweave.net/7zgVUHtuj4PKHtNzMkMf4GAxwLxO3z_gU1z56HUnRJE",
        "https://arweave.net/ruV2Lplf5Op0FETi5tuLIYt8lhQRnIQL5II8K-CvVWY",
        "https://arweave.net/Ujf7bMrLq0c5USvj53z7gi1aDUH0_9b0Hz5oyJ6NoaI",
        "https://arweave.net/cKK4zF2fEbC42hEVrEz12NtQgPTqHxS7FQC88LDvQHU",
        "https://arweave.net/taxxJ8OKldcfwEG1aEN-f9BmP31KXOoGPwBkFriU58A",
        "https://arweave.net/HQ_7l7rVbcywsCsX5NN-fxGjXKxaoKlRoHnBJfviURg",
        "https://arweave.net/3N_WNaGyrWnycg9mbAPaCwWL2Kdpz-aR27eHo1Tak7w",
        "https://arweave.net/Xf2Snxtqx9rL6v9uqqv3d17IsIBhlSrmlcWToaqfPZ8",
        "https://arweave.net/n4YbLErqT8J2mJZTbwZbYXCmV_5Rh-AnlH34DefJx4c",
        "https://arweave.net/a2MgzkSKaN5bOi1CqXt-m5N-y89Z2Sv6ME7oTdB7gZg"];

        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }
    //NewB
    else {
        let avatars = ["https://arweave.net/dERd63m8IANJibpM34YisI8Gkch1AHzT31ZL7wFPIy8",
        "https://arweave.net/JDBATePKdD9ssUO16PT5gzH4hEIQ_g2GLB8rBCV23OA",
        "https://arweave.net/Ttpbgz2SxyOmNHXbVNyp99BmQFRLEUUG13NhBlT3tTQ",
        "https://arweave.net/R8OKcmnmzyJ-Z7msImFCOCfoOB_6EFC1qdWU-uf9lBM",
        "https://arweave.net/gBsTj_Nl5qe0jPX6o0yd7d42_l7V5KI86FD7mswZ2Vs",
        "https://arweave.net/XFIqfE0SOPNezRkiNaRCunjN14pYwrWhRHf6hzg3Cis",
        "https://arweave.net/s108r3FmWHnyUbAUW51WiPfVURJAANmGOYcmWoU73Qg",
        "https://arweave.net/T3fRbZBso7qk0sKRtGg7VUeLCy3xUyJMTkE8hZ1OelM",
        "https://arweave.net/44opKnjpKtsNB3uXQVWzP4S8XxyxoQpINHorzg3CoO0",
        "https://arweave.net/QZLXciA8DoyFZP3Z_pp4Si3k5Pwg-xHpPiYckbiFh40"];
        avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()]
    }

}

pub fn transfer_sol(program_id:&Pubkey, accounts: &[AccountInfo])-> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    let _program_id = program_id;

    let payer_account_info = next_account_info(account_info_iter)?;  
    let receiver_account_info = next_account_info(account_info_iter)?;  

    invoke(
        &system_instruction::transfer(&payer_account_info.key, &receiver_account_info.key, 1e9 as u64),
        &[payer_account_info.clone(), receiver_account_info.clone()],
    )?;
    Ok(())
}

pub fn mint_nft(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    
    let account_info_iter = &mut accounts.iter();


    let payer_account_info = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let metadata_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    // let associated_token_program_info = next_account_info(account_info_iter)?;
    let temp_key = Pubkey::from_str("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z").unwrap();
    if vault.key != &temp_key {
        Err(ProgramError::InvalidAccountData)?
    }


    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;

    // let instruction = Instructions::unpackinst(instruction_data)?;

    // let program_id = next_account_info(account_info_iter)?;
    let space: usize = 82;
    let rent_lamports = Rent::get()?.minimum_balance(space);


    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("{:?}",&sales_pda_info.data);
    let mut sales_account_data: Sales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    // let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    let price = (unitary  * (i32::pow(10,9) as f32)) as u64;

    msg!("Current timestamp: {:?}", current_timestamp);
    let locked_time = lock_time(sales_account_data.counter as f32);
    msg!("Locked time: {:?}", locked_time);
    let unlockable_date: u32 = current_timestamp + locked_time;

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
    creators.push(Creator{address: *mint_authority_info.key, verified: true, share: 0});
    creators.push(Creator{address: *vault.key, verified:false, share:100});

    let mut ves: [u8; 10] = [0;10];
    let mut mult = current_timestamp as f32;
    let mut cnt = 0;

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
    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    if *metadata_pda_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello_C_1");
    invoke_signed(
        &instruction::create_metadata_accounts(id(), *metadata_pda_info.key, *mint_account_info.key, *mint_authority_info.key, *payer_account_info.key, *mint_authority_info.key, "Gamestree Avatar".to_string(), "Gtree".to_string(), select_uri(index_uri).to_string(), Some(creators), 500, true, true),
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
    msg!("Hello_C_2");
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


    let avatar_data_pda_seed: &[&[u8]; 3] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
        &associated_account_info.key.to_bytes()
    ];
    let (avatar_data_pda, avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello8");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &avatar_data_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), avatar_data_pda_info.clone()],
        &[
            &[        
                b"avatar_data_pda",
                &mint_account_info.key.to_bytes(),
                &associated_account_info.key.to_bytes(),
                &[avatar_data_pda_bump]
                ]
                ]
    )?;
    msg!("Hello9");
    let avatar_pda_account_data = AvatarData{
        date_created: current_timestamp,
        unlockable_date: unlockable_date,
        level: 0,
        xp: 0,
    };
    avatar_pda_account_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
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
    ClaimXp{xp_increase:u32},
    CreateSalesAccount,
    TransferSol
}

impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        msg!("{:?}", data);
        match data[0]{
         0 => {Ok(Self::MintNft)}
            1 => {Ok(Self::UnlockMint)}
            2 => {

                let mut total_increase: u32 = 0;
                for unit_increase in data[1..].iter() {
                    total_increase += *unit_increase as u32;
                }
                Ok(Self::ClaimXp{xp_increase:total_increase})}
            3 => {Ok(Self::CreateSalesAccount)}
            4 => {Ok(Self::TransferSol)}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn create_sales_account(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    
    if !payer_account_info.is_signer || payer_account_info.key != &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(ProgramError::InvalidAccountData)?
    }

    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("sales_pda doesn't match");
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


    let sales_account_data = Sales{
        vault_total : 1.0,
        counter :  1
    };

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn unlock_account(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();


    let mint_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let mint_authority_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;

    msg!("Hello_a");
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"cyrial_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"cyrial_pda", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    let avatar_data_pda_seed: &[&[u8]; 3] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
        &associated_account_info.key.to_bytes()
    ];
    let avatar_pda_account_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    msg!("Hello_b");
    if current_timestamp > avatar_pda_account_data.unlockable_date{
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
        msg!("This Account's Unlock time hasn't yet reached. It will be unlocked on {:?}. Chech to see you sent the correct account", avatar_pda_account_data.unlockable_date);
        return Err(ProgramError::InvalidAccountData );
    }
    Ok(())
}

fn claim_xp(program_id: &Pubkey, accounts: &[AccountInfo], to_increase_by: u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    
    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer || payer_account_info.key !=  &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(ProgramError::InvalidAccountData)?
    }


    let avatar_data_pda_seed: &[&[u8]; 3] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
        &associated_account_info.key.to_bytes()
    ];
    let mut avatar_pda_account_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    avatar_pda_account_data.xp += to_increase_by;
    avatar_pda_account_data.level = (0.01 * (avatar_pda_account_data.xp as f32).powf(1.0/3.0)) as u8;
    avatar_pda_account_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    Ok(())
}

pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello world");
    let instruction = InstructionEnum::decode(instruction_data)?;
        match instruction {

            InstructionEnum::MintNft =>{
                mint_nft(program_id, accounts)
            }
            InstructionEnum::UnlockMint => {
                unlock_account(program_id, accounts)
            }   

            InstructionEnum::ClaimXp{xp_increase} =>{
                claim_xp(program_id, accounts, xp_increase)
            }
            InstructionEnum::TransferSol =>{
                transfer_sol(program_id, accounts)
            }
            InstructionEnum::CreateSalesAccount =>{create_sales_account(program_id, accounts)}
        }
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