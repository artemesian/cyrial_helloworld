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
use metaplex_token_metadata::{instruction, state::{Creator}};
use metaplex_token_metadata::id;

// use solana_sdk::{borsh::try_from_slice_unchecked};
use std::str::FromStr;
entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize, Copy, Clone)]
pub struct Sales{
    pub vault_total: f32,
    pub counter: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AvatarData{
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
                 7 =>{689}
                 6 =>{435}
                 5 =>{610}
                 4 =>{555}
                 3 =>{50}
                 2 =>{850}
                 _ => {700}
             }
         }
         None => {ind % 1000}
    };
    //Champion
    if new_ind == 689{
        let avatars = ["https://arweave.net/9PpWTTi7HtqsaqVA3Xj3HSSOgZmSd6Xp8LtIIJGpXZQ",
        "https://arweave.net/HrwBGdAvm7JNcwtELnFcKpASzOxpM6DiabXNhwzhIvo",
        "https://arweave.net/jMS9hTVfVDzZTLmjK4b9wMlU5IvaKkaIq4rkWd8v6tI",
        "https://arweave.net/hW1v0aRSgyiLSf3T-g-KrVy149vnLxRogzW1OKhJ9M4"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 7)
    }
    //Proffesional
    else if new_ind >= 432 && new_ind <442 {
        let avatars = ["https://arweave.net/d7SkjEvOnrnjd70VJolcYH9wPHvKlCnHbK-cELj80ns",
        "https://arweave.net/P0KnKMBd1HDEiuusImQyCZvXxMPIeTwnxAhpUKak-dU",
        "https://arweave.net/L4RT2S0lMfpCb-VSgcxgQf2_d_yQtLcd7LPG69ktZ7Y",
        "https://arweave.net/XbcADvU4mVYA16uQ9ntgT5mqeBReReEGB0gBlfQcGt0",
        "https://arweave.net/o_RA3BIqkCfVJBDk2BoUinTVKzn7kp1sd66HhmNDxus",
        "https://arweave.net/dfqYLcfA-IfAm5kwxe9r4FY7t4GjI3tQ5qp71PF5NUI"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 6)
    }
    //Rookie
    else if new_ind >= 600 && new_ind < 634{
        let avatars =  ["https://arweave.net/--IWT_ar1dmtaD59TmuEtxpzo78dA1CtB0Rw4NQImgY",
        "https://arweave.net/OgLLqseURKEhpnG2pemY8-GABb02Sv3-bd-Z-zSCU6E",
        "https://arweave.net/1Cg372-PuRnC3NpQPkU_S2mwQ1cA5c0INw6iGjh6qm8",
        "https://arweave.net/QuLsWewEBafc1vgj81CCqXM9RHWThNLpdYlF69f7n4s",
        "https://arweave.net/JXB0E8Y2qibfWnBH2a46Nr6tWDjoUXQw94lp8nIF8Go",
        "https://arweave.net/BG_y-_b9Wf9cWqPbiqq8a29HTyzF7ZkzQoU2WoZt2uE"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 5)
    }
    //Amature
    else if new_ind >= 545 && new_ind < 600{
        let avatars =["https://arweave.net/aHxrUZhvlBlwKl5fS0R7xeVb7cSiUO2DrjtkymGZmYA",
        "https://arweave.net/T61vjM7QnPX_1xF2pYeqXefzAeFN36CoJVWhAYpqOqQ",
        "https://arweave.net/e37eKriHf96MTgTkQQf-MoqPqetJzgLxstLQqZKoDxE",
        "https://arweave.net/plH8N9Y-hlR0wZBreKvoGrWebOfNrsfGEqLf2N8QSsE",
        "https://arweave.net/O3v3x7bDzmmoegsOJD-0PaXZZp5nYaDErjQ16LMOrm8",
        "https://arweave.net/EY8tIfzsjz2GVKgojuYw5aD6993TsETZN_2ybkZVdak"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 4)
    }
    //Local
    else if new_ind < 100{
        let avatars =  ["https://arweave.net/s6BsAVvf6ghtUKt1H8eoirE-yZBPvBjqN3Wyguyc1e8",
        "https://arweave.net/b7qTQMMzzBPmCKFPYb930axSH-EmZ-nGg3AROB-QZQA",
        "https://arweave.net/PF361VjEBHx81b9CTxZfnCO2XNJ3L3caGIQj9DyuDrg",
        "https://arweave.net/jUt_Epc5vFBsDfTHMIcuVybofVN8mbS9CpcmZD3fjHs",
        "https://arweave.net/BKiGDPit3T1xVFZ2Wc1QLbTsfo2sTLcNokbqlx2Y-uY",
        "https://arweave.net/HVzFwe4ZCEg_hEM4bkLsRC7FsLrwFfo_9PBb8Sy9J4Y",
        "https://arweave.net/lbD_lTQjomJkvpTXZ6hiGWNkpsN0d2GUbst6zpmEdYs",
        "https://arweave.net/c9I8MC-4T5zzGsLy5LJ-Hj3ocZ05KaafqMp5annaONM"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 3)
    }
    //Casual
    else if new_ind > 800{
        let avatars = ["https://arweave.net/IxukmJfBlOuSepj2hdaqyTLmaTnDZXQnqJTs97qr-lA",
        "https://arweave.net/vlb-F7-S-qdYmvXVpK4GExTp_obewqdA_yFUeSQ0I14",
        "https://arweave.net/UN8cD_YeTYBj7qvxw6ehsTlen-LotD-tKmFLG54LGrU",
        "https://arweave.net/jVYynpUgTQMqZJdYz2KRoJweDu_3kh-swyVmCbNoGVw",
        "https://arweave.net/WRSuzjG5uWeItfBzGUwK7h12nlT_uYXnzEG8Tq7fg8M",
        "https://arweave.net/PWrCyeV0KXCT1Q0fCZBA9DFhIErsT0vDK__WlpmMka8",
        "https://arweave.net/TODSEFXy_znd-HQV2rXfPYTumscOXtShvVU2MeRcbI0",
        "https://arweave.net/0mkC4YFF2SDckKNTSU2nqS9Xxa7DEhCodvqwhe8oh3o",
        "https://arweave.net/4hhUOFtBpPHQrNRwkDJKpQpvW4wL5Dux5wjYd6v0SHs",
        "https://arweave.net/YVBheCFbLPF3cksqZfYCWc0rReZDVLUS782ViWNk-tc",
        "https://arweave.net/GvirKFNoGQ1PhCzkNyG5BDINVlnaZ9Nj7T_PPf6FbR8"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 2)
    }
    //NewB
    else {
        let avatars = ["https://arweave.net/x_6w07Fdw-AD48dS4BRbXyQQtWKm9nzQS10zqBeLGV8",
        "https://arweave.net/z7IuHYAz1vmY6aN3e9aDpYK3QP31muhP_C5L7-4o-4c",
        "https://arweave.net/uV_No3g8qVOoTEKCoIPUvdQRvZjapZ7ryC7PKkDtoSQ",
        "https://arweave.net/OD9qv9iHThs9qU_S7HIrWo7vxjMxOl6OkVbiq2CWq0o",
        "https://arweave.net/t6W1W_FIUqon4qPT1srhINpbEZXeIgnc5k1HyVe4aA4",
        "https://arweave.net/HqedV5z0wI0boB1EgERV3x-9LeZqOFB8E6qRY7AarKk",
        "https://arweave.net/t3FEIA2ciOXEPCtojae_e9IiEiR6-urIq2agK5AHOYA",
        "https://arweave.net/EFa2XB5NSWedSEdcVu_UMO6vEZP5mEikBqfJoRHdI0I",
        "https://arweave.net/KRNDxr6O8YQremLzPLeut7Cv5sLNozov0Qa5BgZuTdM",
        "https://arweave.net/c2cmZycexv1xAfyMIn0j1uu6CMmnEQ0KSgoIZphQBOw"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 1)
    }

}


fn get_price(sales_account_data:Sales) -> u64{
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    (unitary  * (i32::pow(10,9) as f32)) as u64
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

    let price = get_price(sales_account_data);

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
        &instruction::create_metadata_accounts(id(), *metadata_pda_info.key, *mint_account_info.key, *mint_authority_info.key, *payer_account_info.key, *mint_authority_info.key, "Gamestree Avatar".to_string(), "Gtree".to_string(), selected_uri.to_string(), Some(creators), 500, true, true),
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
        numeration: sales_account_data.counter,
        rarity: rarity,
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
    ClaimXp{xp_claims:Vec<u32>},
    CreateSalesAccount,
    BurnNFTs{rarity: u8}
}


impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        match data[0]{
            0 => {Ok(Self::MintNft)}
            1 => {Ok(Self::UnlockMint)}
            2 => {
                let num_mints = get_num_cnt(&data[1..4]);
                let mut xp_claims: Vec<u32> = Vec::new();
                for i in 0..num_mints{
                    let ind = i as usize * (3) + 1 + 3;
                    let total_increase = get_num_cnt(&data[ind+32 .. ind+32+3]);
                    xp_claims.push(total_increase);
                }
                Ok(Self::ClaimXp{xp_claims:xp_claims})}
            3 => {Ok(Self::CreateSalesAccount)}
            4 => {Ok(Self::BurnNFTs{rarity: data[1]})}
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

fn claim_xp(program_id: &Pubkey, accounts: &[AccountInfo], xp_claims: Vec<u32>) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    
    let payer_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer || payer_account_info.key !=  &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(ProgramError::InvalidAccountData)?
    }

    for to_increase_by in 0..xp_claims.len(){

        let mint_account_info = next_account_info(account_info_iter)?;
        let associated_account_info = next_account_info(account_info_iter)?;
        let avatar_data_pda_info = next_account_info(account_info_iter)?;

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

        avatar_pda_account_data.xp += to_increase_by as u32;
        avatar_pda_account_data.level = (0.01 * (avatar_pda_account_data.xp as f32).powf(1.0/3.0)) as u8;
        avatar_pda_account_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    }
    Ok(())
}

fn num_to_burn(rarity:u8) -> Result<u8, ProgramError>{
    match rarity{
        1=>{Ok(3)}
        2=>{Ok(2)}
        3=>{Ok(2)}
        4=>{Ok(2)}
        5=>{Ok(4)}
        6=>{Ok(10)}
        _=>{Err(ProgramError::InvalidInstructionData)?}
    }
}

fn burn_nft(program_id: &Pubkey, accounts: &[AccountInfo], rarity: u8)-> ProgramResult{

    let account_info_iter = &mut accounts.iter();


    let payer_account_info = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    let _ = next_account_info(account_info_iter)?;
    

    let num_to_burn = match num_to_burn(rarity){
        Ok(num) => { num }
        Err(_) => {Err(ProgramError::InvalidInstructionData)?}
    };

    msg!("Hellow_Bn_1");
    for _num_burned in 0..num_to_burn{

        let curr_associated_account_info = next_account_info(account_info_iter)?;
        let curr_mint_account_info = next_account_info(account_info_iter)?;
        let curr_avatar_data_pda_info = next_account_info(account_info_iter)?;


        let avatar_data_pda_seed: &[&[u8]; 3] = &[
            b"avatar_data_pda",
            &curr_mint_account_info.key.to_bytes(),
            &curr_associated_account_info.key.to_bytes()
        ];
        let curr_avatar_pda_account_data: AvatarData = try_from_slice_unchecked(&curr_avatar_data_pda_info.data.borrow())?;
        let (curr_avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
        if curr_avatar_data_pda_info.key != &curr_avatar_data_pda{
            msg!("Error_Bn_1");
            Err(ProgramError::InvalidAccountData)?
        }
        if curr_avatar_pda_account_data.rarity != rarity{
            msg!("Error_Bn_2");
            Err(ProgramError::InvalidAccountData)?
        }
        invoke(
            &burn(token_program_info.key, curr_associated_account_info.key, curr_mint_account_info.key, payer_account_info.key, &[], 1)?,
            &[curr_associated_account_info.clone(), curr_mint_account_info.clone(), payer_account_info.clone()],
        )?;
    }
    msg!("Hellow_Bn_2");
    Ok(mint_nft(program_id, accounts, Some(rarity+1))?)
}

pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
        let instruction = InstructionEnum::decode(instruction_data)?;
        match instruction {

            InstructionEnum::MintNft =>{
                mint_nft(program_id, accounts, None)
            }
            InstructionEnum::UnlockMint => {
                unlock_account(program_id, accounts)
            }   

            InstructionEnum::ClaimXp{xp_claims} =>{
                claim_xp(program_id, accounts, xp_claims)

            }
            InstructionEnum::CreateSalesAccount =>{create_sales_account(program_id, accounts)}

            InstructionEnum::BurnNFTs{rarity} => {burn_nft(program_id, accounts, rarity)}
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