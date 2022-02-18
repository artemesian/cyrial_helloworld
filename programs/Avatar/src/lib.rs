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
    program_error::ProgramError, program_pack::Pack,
};
use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};
use spl_token::{instruction::*,
                state::Account,
                };
use metaplex_token_metadata::{instruction, state::{Creator}};
use metaplex_token_metadata::id;

// use solana_sdk::{borsh::try_from_slice_unchecked};
use std::str::FromStr;
entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize)]
struct Sales{
     vault_total: f32,
     counter: u32,

     rent_min_listed: u32,
     rent_max_listed: u32,
     rent_max_ever: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct AvatarData{
     date_created: u32,
     unlockable_date: u32,
     numeration: u32,
     rarity: u8,
     level: u8,
     xp: u32,
     rented_state: bool,
     use_authority: Pubkey,
     rent_bump: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct RentContainerData{
    mint_address: Pubkey,
    owner: Pubkey,
    renter: Pubkey,
    state: bool,
    rent_price: f32,
    duration: u64,
    required_rating: u32,
    ending_date: u64, 
    earnings_percentage : f32,
    cummulative_5week_hands: u32,
}


#[derive(BorshSerialize, BorshDeserialize)]
struct AccountRentSpace{
    state: bool,
    nft_owner: Pubkey,
    mint_id: Pubkey,
    container_bump: u32,
}


fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}

fn get_rand_num(current_timestamp: f32, mint_key:&Pubkey, program_id: &Pubkey) -> u32 {
    let mut ves: [u8; 10] = [0;10];
    let mut mult = current_timestamp;
    let mut cnt = 0;
    while cnt <10 {
        ves[cnt] = (mult as u32 % 256) as u8;
        mult = mult / 7.0;
        cnt += 1;
    }
    let new_hash = hash::hashv(&[&ves, &mint_key.to_bytes(), &program_id.to_bytes()]);
    let mut index_uri: u32 = 0;
    for i in new_hash.to_bytes().iter(){
        index_uri += (*i as u32) * (*i as u32);
    }

    index_uri
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


fn get_price(sales_account_data: &Sales) -> u64{
    let x = sales_account_data.counter as f32;

    15 * (((100.0 + x.powf(0.6) + 270.0*( std::f32::consts::E.powf(0.08*x - 10.0)/(1.0+std::f32::consts::E.powf(0.08*x - 10.0)) )  )/15.0)).floor() as u64  * 10e9 as u64
}

fn mint_nft(program_id: &Pubkey, accounts: &[AccountInfo], selected_rarity: Option<u8>) -> ProgramResult{
    
    let account_info_iter = &mut accounts.iter();


    let payer_account_info = next_account_info(account_info_iter)?;
    let payer_dsol_token_account_info = next_account_info(account_info_iter)?;
    let vault = next_account_info(account_info_iter)?;
    let vault_dsol_token_account_info = next_account_info(account_info_iter)?;
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
    // TODO: At the end we shall have to have a unique main vault and use his address through out our contracts
    // let temp_key = Pubkey::from_str("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z").unwrap();
    // if vault.key != &temp_key {
    //     Err(ProgramError::InvalidAccountData)?
    // }

    msg!("Position 1");
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    msg!("Position {:?}", clock);
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    
    // let instruction = Instructions::unpackinst(instruction_data)?;
    
    // let program_id = next_account_info(account_info_iter)?;
    let space: usize = 82;
    msg!("Position before rent");
    let rent_lamports = Rent::get()?.minimum_balance(space);
    
    msg!("Position id {:?}", program_id);
    // let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes()];
    
    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"sales_pda"], program_id);
    
    msg!("Position {:?} {:?}", sales_pda, sales_pda_info.key);
    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("{:?}",&sales_pda_info.data);
    let mut sales_account_data: Sales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    // let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    let price = get_price(&sales_account_data);

    msg!("Current timestamp: {:?}", current_timestamp);
    let unlockable_date: u32 = current_timestamp;

    // let rent = Rent::from_account_info(rent_account_info)?;
    msg!("Transfer DSOL token");
    invoke(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &payer_dsol_token_account_info.key,
            &vault_dsol_token_account_info.key,
            &payer_account_info.key,
            &[],
            price
        )?,
        &[payer_dsol_token_account_info.clone(), vault_dsol_token_account_info.clone(), payer_account_info.clone()]
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

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
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
            // token_program_info.clone(),
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

    // let mut ves: [u8; 10] = [0;10];
    // let mut mult = current_timestamp as f32;
    // let mut cnt = 0;

    // msg!("Hello_C_1");

    // while cnt <10 {
    //     ves[cnt] = (mult as u32 % 256) as u8;
    //     mult = mult / 7.0;
    //     cnt += 1;
    // }
    // let new_hash = hash::hashv(&[&ves, &mint_account_info.key.to_bytes(), &program_id.to_bytes()]);
    // let mut index_uri: u32 = 0;
    // for i in new_hash.to_bytes().iter(){
    //     index_uri += (*i as u32) * (*i as u32);
    // }
    msg!("Hello_C_0");
    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    let (selected_uri, rarity) = select_uri(get_rand_num(current_timestamp as f32, mint_account_info.key, program_id), selected_rarity);

    msg!("Hello_C_2");

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

    // invoke_signed(
    //     &freeze_account(
    //         &token_program_info.key,
    //         &associated_account_info.key,
    //         &mint_account_info.key,
    //         &mint_authority_info.key,
    //         &[]
    //     )?,
    //     &[
    //         associated_account_info.clone(),
    //         mint_account_info.clone(),
    //         mint_authority_info.clone(),
    //     ],
    //     &[signers_seeds],

    // )?;
    // msg!("Hello7");


    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
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
        rented_state: false,
        use_authority: *payer_account_info.key,
        rent_bump: 0
        
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
enum InstructionEnum{
    MintNft,
    UnlockMint,
    ClaimXp{xp_claims:Vec<u32>},
    CreateSalesAccount,
    BurnNFTs{rarity: u8},
    LeaseAvatar{
        duration: u64,
        earnings_percentage: f32,
        rent_price: f32,
        cummulative_5week_hands: u32,
        required_rating: u32
    },
    RentAvatar,
    CloseLeaseListing,
    EndRent,
    CreateVaultDsolTokenAccount,
}

fn lease_avatar(program_id: &Pubkey, accounts: &[AccountInfo], duration:u64, rent_price: f32, earnings_percentage: f32, cummulative_5week_hands: u32, required_rating: u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    // let use_authority_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let container_account_info = next_account_info(account_info_iter)?;
    let freeze_authority_info = next_account_info(account_info_iter)?;
    let spl_program_info = next_account_info(account_info_iter)?;

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
    if &mint_authority_pda != freeze_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    } 


    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    let associated_token_address = get_associated_token_address(payer_account_info.key, mint_account_info.key);
    if *associated_account_info.key != associated_token_address{
        Err(ProgramError::InvalidAccountData)?
    }
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    let associated_token_address_data = Account::unpack(&associated_account_info.data.borrow())?;
    if associated_token_address_data.amount != 1{
        Err(ProgramError::InvalidAccountData)?
    }
    
    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut collection_data: Sales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    
    let collection_unique_bump = collection_data.rent_max_listed;
    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    if collection_data.rent_max_listed == collection_data.rent_max_ever{
        collection_data.rent_max_ever +=  1;
        let space = 50;
        let lamports = Rent::get()?.minimum_balance(space as usize);
        invoke_signed(
            &system_instruction::create_account(&payer_account_info.key, &container_pda, lamports, space, &program_id),
            &[payer_account_info.clone(), container_account_info.clone()],
            &[container_seed]
        )?;
    }
    else{
        let current_container_data: RentContainerData = try_from_slice_unchecked(&container_account_info.data.borrow())?;
        if current_container_data.state == true{
            msg!("current Container doesn't seem to be Empty, Big Problem");
            Err(ProgramError::InvalidSeeds)?
        }
    }

    
    let new_container_data = RentContainerData{
        mint_address: *mint_account_info.key,
        owner: *payer_account_info.key,
        state: true,
        renter: *payer_account_info.key,
        rent_price: rent_price,
        duration: duration,
        ending_date: current_timestamp as u64,
        earnings_percentage: earnings_percentage,
        cummulative_5week_hands: cummulative_5week_hands,
        required_rating: required_rating,
    };

    new_container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;


    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

    avatar_data.rented_state = true;
    avatar_data.use_authority = *payer_account_info.key;
    avatar_data.rent_bump = collection_unique_bump;
    // avatar_data.unlockable_date = current_timestamp + duration as u32;
    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;

    collection_data.rent_max_listed += 1;

    collection_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;


    invoke_signed(
        &freeze_account(spl_program_info.key, &associated_token_address, mint_account_info.key, freeze_authority_info.key, &[])?,
        &[
            associated_account_info.clone(),
            mint_account_info.clone(),
            freeze_authority_info.clone(),
        ],
        &[signers_seeds],
    )?;
    Ok(())
}


fn rent_avatar(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let admin_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let rent_container_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let account_rent_space_info = next_account_info(account_info_iter)?;
    let mint_owner_info = next_account_info(account_info_iter)?;


    if !admin_account_info.is_signer || *admin_account_info.key != Pubkey::from_str("Admin").unwrap(){
        Err(ProgramError::InvalidAccountData)?
    }
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }


    let (account_rent_pda, _account_rent_pda_bump) = Pubkey::find_program_address(&[b"account_rent_space", &payer_account_info.key.to_bytes()], program_id);

    if account_rent_pda != *account_rent_space_info.key{
        Err(ProgramError::Custom(1))?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

    
    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut rent_container_data:RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;

    if rent_container_data.ending_date > current_timestamp as u64 || avatar_data.use_authority != rent_container_data.owner{
        Err(ProgramError::Custom(2))?
    }

    if rent_container_data.rent_price != 0.0 {
        invoke(
            &system_instruction::transfer(payer_account_info.key, &rent_container_data.owner,(rent_container_data.rent_price * 10e9) as u64),
            &[payer_account_info.clone(), mint_owner_info.clone()]
        )?;
    }

    avatar_data.unlockable_date = current_timestamp + rent_container_data.duration as u32;
    avatar_data.use_authority = *payer_account_info.key;
    rent_container_data.renter = *payer_account_info.key;
    rent_container_data.ending_date = current_timestamp as u64 + rent_container_data.duration;
    let temp_account_rent_data:AccountRentSpace = try_from_slice_unchecked(&account_rent_space_info.data.borrow())?;
    if temp_account_rent_data.state{
        Err(ProgramError::Custom(3))?
    }
    let account_rent_data = AccountRentSpace{
        state: true,
        nft_owner: rent_container_data.owner,
        mint_id: *mint_account_info.key,
        container_bump: avatar_data.rent_bump,
    };

    account_rent_data.serialize(&mut &mut account_rent_space_info.data.borrow_mut()[..])?;
    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    rent_container_data.serialize(&mut &mut rent_container_pda_info.data.borrow_mut()[..])?;


    
    Ok(())
}

fn close_lease_listing(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let rent_container_pda_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let associated_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let freeze_authority_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    let spl_program_info = next_account_info(account_info_iter)?;
    let max_container_info = next_account_info(account_info_iter)?;
    let max_container_mint_info = next_account_info(account_info_iter)?;
    let max_container_avatar_pda_info = next_account_info(account_info_iter)?;

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    if &mint_authority_pda != freeze_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    } 

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u64;


    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    let mut rent_container_data: RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;

    let associated_token_address = get_associated_token_address(payer_account_info.key, mint_account_info.key);
    if *associated_account_info.key != associated_token_address{
        Err(ProgramError::InvalidAccountData)?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    
    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    if !avatar_data.rented_state || !rent_container_data.state{
        Err(ProgramError::Custom(1))?
    }

    if *payer_account_info.key != rent_container_data.owner || !payer_account_info.is_signer{
        Err(ProgramError::Custom(2))?
    }


    if  rent_container_data.renter != rent_container_data.owner || avatar_data.use_authority != rent_container_data.owner{
        if rent_container_data.ending_date > current_timestamp{
            Err(ProgramError::Custom(3))?
        }
    }

    let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(sales_pda_seeds, program_id);

    if &sales_pda != sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
    invoke_signed(
        &thaw_account(spl_program_info.key, &associated_token_address, mint_account_info.key, freeze_authority_info.key, &[])?,
        &[
            associated_account_info.clone(),
            mint_account_info.clone(),
            freeze_authority_info.clone(),
        ],
        &[signers_seeds],
    )?;

    
    avatar_data.use_authority = rent_container_data.owner;
    rent_container_data.renter = rent_container_data.owner;
    avatar_data.rented_state = false;
    // rent_container_data.state = false;
    // rent_container_data.duration = 0;
    // rent_container_data.ending_date = current_timestamp;
    avatar_data.rent_bump = 0;


    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;

    let mut sales_account_data: Sales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;

    let max_bump = sales_account_data.rent_max_listed;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &max_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *max_container_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let max_container_data: RentContainerData = try_from_slice_unchecked(&max_container_info.data.borrow())?;
    max_container_data.serialize(&mut &mut rent_container_pda_info.data.borrow_mut()[..])?;    

    let max_avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &max_container_mint_info.key.to_bytes(),
    ];


    let (max_container_avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(max_avatar_data_pda_seed, program_id); 
    if max_container_avatar_pda_info.key != &max_container_avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut max_avatar_data: AvatarData = try_from_slice_unchecked(&max_container_avatar_pda_info.data.borrow())?;

    max_avatar_data.rent_bump = collection_unique_bump;
    max_avatar_data.serialize(&mut &mut max_container_avatar_pda_info.data.borrow_mut()[..])?;

    sales_account_data.rent_max_listed = sales_account_data.rent_max_listed - 1;

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;
   

    Ok(())
}

fn end_rent(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let mint_account_info = next_account_info(account_info_iter)?;
    let avatar_data_pda_info = next_account_info(account_info_iter)?;
    let rent_container_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let account_rent_space_info = next_account_info(account_info_iter)?;


    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    if !payer_account_info.is_signer{
        Err(ProgramError::InvalidAccountData)?
    }


    let (account_rent_pda, _account_rent_pda_bump) = Pubkey::find_program_address(&[b"account_rent_space", &payer_account_info.key.to_bytes()], program_id);

    if account_rent_pda != *account_rent_space_info.key{
        Err(ProgramError::Custom(1))?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

    
    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut rent_container_data:RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;

    if avatar_data.use_authority != *payer_account_info.key || rent_container_data.renter != *payer_account_info.key{
        Err(ProgramError::Custom(2))?
    }

    avatar_data.unlockable_date = current_timestamp + rent_container_data.duration as u32;
    avatar_data.use_authority = rent_container_data.owner;
    rent_container_data.renter = rent_container_data.owner;
    rent_container_data.ending_date = current_timestamp as u64;
    let temp_account_rent_data:AccountRentSpace = try_from_slice_unchecked(&account_rent_space_info.data.borrow())?;
    if !temp_account_rent_data.state{
        Err(ProgramError::Custom(3))?
    }
    let account_rent_data = AccountRentSpace{
        state: false,
        nft_owner: rent_container_data.owner,
        mint_id: *mint_account_info.key,
        container_bump: avatar_data.rent_bump,
    };

    account_rent_data.serialize(&mut &mut account_rent_space_info.data.borrow_mut()[..])?;
    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    rent_container_data.serialize(&mut &mut rent_container_pda_info.data.borrow_mut()[..])?;


    
    Ok(())
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
            5 => {
                
                Ok(Self::LeaseAvatar{
                    duration: get_num_cnt(&data[1..4]) as u64 * 86400,
                    earnings_percentage: data[4] as f32 + (data[5] as f32 / 100.0),
                    rent_price: get_num_cnt(&data[6..9]) as f32 + (get_num_cnt(&data[9..12]) as f32 / 100.0),
                    cummulative_5week_hands: get_num_cnt(&data[12..15]),
                    required_rating: get_num_cnt(&data[15..18])
                })
            }
            6 => {Ok(Self::RentAvatar)}
            7 => {Ok(Self::CloseLeaseListing)}
            8 => {Ok(Self::EndRent)}
            9 => {Ok(Self::CreateVaultDsolTokenAccount)}
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

    // let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"sales_pda"], program_id);

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
                &[_sales_pda_bump]
                ]
                ]
    )?;


    let sales_account_data = Sales{
        vault_total : 1.0,
        counter :  1,
        rent_min_listed: 0,
        rent_max_listed: 0,
        rent_max_ever: 0,
    };

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn create_vault_dsol_token_account(_program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let vault_account_info = next_account_info(account_info_iter)?;
    let vault_dsol_token_account_info = next_account_info(account_info_iter)?;
    let dsol_mint_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    // TODO: At the end we shall have to have a unique main payer and use his address through out our contracts
    // if !payer_account_info.is_signer || payer_account_info.key != &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
    //     Err(ProgramError::InvalidAccountData)?
    // }

    invoke(
        &create_associated_token_account(
            payer_account_info.key, 
            vault_account_info.key,
            dsol_mint_info.key
        ),
        &[
            payer_account_info.clone(),
            vault_dsol_token_account_info.clone(),
            vault_account_info.clone(),
            dsol_mint_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ]
    )?;

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
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
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
        let avatar_data_pda_info = next_account_info(account_info_iter)?;

        let avatar_data_pda_seed: &[&[u8]; 2] = &[
            b"avatar_data_pda",
            &mint_account_info.key.to_bytes(),
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


        let avatar_data_pda_seed: &[&[u8]; 2] = &[
            b"avatar_data_pda",
            &curr_mint_account_info.key.to_bytes(),
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
            InstructionEnum::LeaseAvatar{
                duration,
                earnings_percentage,
                rent_price,
                cummulative_5week_hands,
                required_rating
            } => {lease_avatar(program_id, accounts, duration, rent_price, earnings_percentage, cummulative_5week_hands, required_rating)}
            InstructionEnum::RentAvatar => {rent_avatar(program_id, accounts)},
            InstructionEnum::CloseLeaseListing => {close_lease_listing(program_id, accounts)},
            InstructionEnum::EndRent => {end_rent(program_id, accounts)},
            InstructionEnum::CreateVaultDsolTokenAccount => {create_vault_dsol_token_account(program_id, accounts)},
        }
}

#[cfg(test)]
mod tests {
    // use std::str::FromStr;

    // use solana_program::pubkey::Pubkey;

    use crate::{Sales, get_price, get_num_cnt, get_rand_num};
    use solana_program::{pubkey::Pubkey, msg};
    use std::str::FromStr;

    #[test]
    fn testing_get_price() {
        // let mut x: Option<&Pubkey> = Some(&Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap());

        let sales_account_data = Sales{
            vault_total :0.0,
            counter :0,
            rent_min_listed: 0,
            rent_max_listed :0,
            rent_max_ever :0,
        };
        assert_eq!(get_price(&sales_account_data), 90*10e9 as u64);
    }

    #[test]
    fn testing_get_num_cnt(){
        assert_eq!(get_num_cnt(&[255,255,255]), 255*255+255);
    }

    #[test]
    fn testing_get_rand_num(){
        let num = 100000 as f32;
        let expected_vals = [(num*0.1/100.0) as u32, (num*1.0/100.0) as u32, (num*3.4/100.0) as u32, (num*5.5/100.0) as u32, (num*10.0/100.0) as u32, (num*20.0/100.0) as u32, (num*60.0/100.0) as u32];
        let mut received_vals:[u32; 7] = [0,0,0,0,0,0,0];

        for i in 0..num as usize{
            let new_ind =  get_rand_num(i as f32, &Pubkey::from_str("FmyvDLhtWu1WMSUWnCpS1aTP3TvEJaCRJt1b8geD5B3J").unwrap(), &Pubkey::from_str("FmyvDLhtWu1WMSUWnCpS1aTP3TvEJaCRJt1b8geD5B3J").unwrap())%1000;

            if new_ind == 689{received_vals[0] += 1;}
            else if new_ind >= 432 && new_ind < 442{received_vals[1] += 1}
            else if new_ind >= 600 && new_ind < 634{received_vals[2] += 1}
            else if new_ind >= 545 && new_ind < 600{received_vals[3] += 1}
            else if new_ind < 100{received_vals[4] += 1}
            else if new_ind > 800{received_vals[5] += 1}
            else{received_vals[6] += 1}
            
        }

        msg!("{:?} : {:?}", expected_vals, received_vals);
        for i in 0..7{
            assert!(expected_vals[i] as f32 + 0.05 * expected_vals[i] as f32 >received_vals[i] as f32 && (expected_vals[i] as f32 - 0.05 * expected_vals[i] as f32) < received_vals[i] as f32);
        }
    }
}