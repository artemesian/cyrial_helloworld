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

extern crate global_repo;

use global_repo::{
    StructId,
    vault,
    dsol_mint,
    avatar,
    error::GlobalError,
};
// use solana_sdk::{borsh::try_from_slice_unchecked};
use std::str::FromStr;
entrypoint!(process_instructions);

#[derive(BorshSerialize, BorshDeserialize)]
struct RentListing{
    payer: [u8;32],
    bump: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct AvatarSales{
     struct_id: u32,
     vault_total: f32,
     counter: u32,
     rent_listings: Vec<RentListing>,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct PayerStorage{
    account_storage_data: u32,
    rent_listings: Vec<RentListing>,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct AvatarData{
     struct_id: u32,
     date_created: u32,
     unlockable_date: u32,
     numeration: u32,
     rarity: u8,
     level: u8,
     xp: u32,
     rented_state: bool,
     use_authority: [u8;32],
     rent_bump: u32,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct RentContainerData{
    struct_id: u32,
    mint_address: [u8;32],
    owner: [u8;32],
    renter: [u8;32],
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
    struct_id: u32,
    state: bool,
    nft_owner: [u8;32],
    mint_id: [u8;32],
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
        let avatars = ["https://arweave.net/CpOk7NBU-vVD7s7N22YXoy0ffAHc-Nwj8FfLIViloiM",
        "https://arweave.net/cpyhC6SqEndUMbkjSeNQjCaOfWq8d-TSmwSOqyXymUo",
        "https://arweave.net/5baiHqdtLBT7gvQ3JIcG-_WpcQwpKAvzdnj_Z-Oxp0M",
        "https://arweave.net/fYLI-txokijyB-NGunyyAU1AopJ6Yu7WX27Fyq8_2nk"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 7)
    }
    //Proffesional
    else if new_ind >= 432 && new_ind <442 {
        let avatars = ["https://arweave.net/fam42-BK6-2nHDae8pmMjNfadAkfkho42wCMoSBz0qk",
        "https://arweave.net/ZAMbpgOnhCx9obof3k9BMBzrkr1HUhYLPda7nauQ_Hs",
        "https://arweave.net/mROVz6TzmfcSqmRvKLpL13Ah6yBvA__KezKcYKuNFYk",
        "https://arweave.net/sroYNtmTLb-RuVQItBwxpJqAiAg-sgCss4hugja6KzE",
        "https://arweave.net/8eE6TanBXmhHbE3iOlqaZGKHBy56TWoI8oydX6TtFXg",
        "https://arweave.net/Oi8-7P55WXMNS-h5sjrAlUbZk7P97_2wnGszjRCZBgc"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 6)
    }
    //Rookie
    else if new_ind >= 600 && new_ind < 634{
        let avatars =  ["https://arweave.net/En6u1uvuUKMb7O1PsQ1uVBHsKshfYToKnV2kzBxx3Nw",
        "https://arweave.net/IG4Tts3nwGQVwt21-xDC68lrqV6OVuKl26mOzF-28KQ",
        "https://arweave.net/FxNFpy32GkEUkafbp3vkNKbTD8Ml29RT1wrWxXbiWl4",
        "https://arweave.net/3XKEMHH7Re34hxYUED_GB9OAvvwb55LThPrGf9eHj9s",
        "https://arweave.net/Z5erD_E1IzvoZOjF6GjVTdD6lDOUAO3OVRSDxFz7g6s",
        "https://arweave.net/vHTgd0Eq8_Z_WgfDr9YpM2ydEcr0wnOOurN79zMVEIE"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 5)
    }
    //Amature
    else if new_ind >= 545 && new_ind < 600{
        let avatars = ["https://arweave.net/jRwtQXRNLRvAdvrauKpIr5scKrVgagiAIxJmC7qwfpo",
        "https://arweave.net/GtP4R5B8mA7BFI6ppJ8Tc-kZ95S8zvrNkLfyIJl5heI",
        "https://arweave.net/xtOWPQoKXZyCdVUO9lNiLRoW44FtteLG_N7cCjlGakI",
        "https://arweave.net/a_RH-sD3REJ-luuXyIDPuFlF_TU_pEzR3gqqwxn65Bo",
        "https://arweave.net/6NtxDqBBD5La9VWgNS3A3cAvlR_XjB5z8WLX_Q0sBNg",
        "https://arweave.net/dScwfDBgy9ewYgHlXnZazdXFq7vsq5yCES9FZBIdU34"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 4)
    }
    //Local
    else if new_ind < 100{
        let avatars =  ["https://arweave.net/qdHHVXSaIK43drpqGN_wuDO_wEgNUsJZlD8ydU6VWbc",
        "https://arweave.net/BRglhPUDSTB24o3rPduGryxMR5J-pLfUn8doL05uLew",
        "https://arweave.net/-XKATnahjrFaOcloYuWQEKw-qGrlXMuzD3gMkQVEwX8",
        "https://arweave.net/N44KoBYpikDkjHLPPT_boeBbGGJEKQCJ8CzbX-UXwOY",
        "https://arweave.net/JU8051m8_JA7RRhVFlm1wGTZTTEZGuG-kZ2eoP-GFvg",
        "https://arweave.net/izdjtPhSRLcIMvX7avLzEvAh9hlHSGRKduKLK2AECPA",
        "https://arweave.net/GnJyP3iJ1sxuefwwAb9IxIRSC8libLpz0gAhCBSNyok",
        "https://arweave.net/qCefeYgtKNWVZtf_2ClK2uivc9gG-y9PUXrgl_8VLjE"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 3)
    }
    //Casual
    else if new_ind > 800{
        let avatars = ["https://arweave.net/Q5jiXKJj1ZX5TYd0ejVvigel-7nn9lxOEKRnpKyPOqg",
        "https://arweave.net/JT0lmgcDDthb80zTdUUvYUWsbqyFD2g38H5qph5NNJk",
        "https://arweave.net/EfwciEqcBWWuKtVbcBkRv1m2I_OjDH3Y7JB9NHL8Tis",
        "https://arweave.net/PGLy6MQg7e-OPYXroyErUB7V_WVc0PRbbl2qOi2tcIQ",
        "https://arweave.net/zPkM8RaQzkB90cv5c71753l4uvQs-M26gZBhZ-gzGDo",
        "https://arweave.net/JmtpPhfsbJnJsMUfBVCOlIzb-DtnUztH7jVfz2hQTjI",
        "https://arweave.net/DmWG6IcgIQs7yKJvPCbGgzm5y7So3_2wpPKyudRo_Jo",
        "https://arweave.net/YonliitZdSEA53-7nuQHp2rneV4ABxH4qRPzq1wHwt4",
        "https://arweave.net/-cDJDLjPtBItePemfMeNTsfY6LOBfEC3iUE_ViBM1_Q",
        "https://arweave.net/qxlvXbN_GVRzYST6FhT5gsECrFYhpcLHxA4dE58qT-Y",
        "https://arweave.net/RU7fyjhQY8edZUTMnKsTLa0mEgUj_IndReooZB82GcI"];

        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 2)
    }
    //NewB
    else {
        let avatars = ["https://arweave.net/Nb-LohzpiLB_XwZwWaV1G1V5khZfSWVVcvK8K1klebU",
        "https://arweave.net/WimminaDHDBBxHby2dzbXTMomy2UYTLDf4ymCCQLtP4",
        "https://arweave.net/LPywYfhL0swv1kxNpuSHv39XXbwEUPKHY7nUU0_LEPg",
        "https://arweave.net/vnyXTcWsTbYamqGHeX8HLBMFWbtwFFUXf1PExMg_Z84",
        "https://arweave.net/xhCy0q2nJIMY9ZCe4LVUjM6Ttmq-e4ZPebjWMtjQ6aw",
        "https://arweave.net/IZdLsGVNL-pmbcALgszEhMcRqT5iXY63KwIXvScfdhc",
        "https://arweave.net/9TfUNj4qsggB4vzeDSqtzd49Lpzux-5X8VJedSuiIvs",
        "https://arweave.net/kls1o1PDJXapqrk8cz-PIzN2OA2T9bPdZUiupX-pARg",
        "https://arweave.net/DNSzlCGMpJsKL83a5QNYktyj_aPUQkITNms7mLKbAiU",
        "https://arweave.net/yeFoixkyf6_Zg9fV-1LGWW11HtNS1o0-orBjPZm7ZnI"];
        (avatars[((ind -new_ind) as f32 / 1000.0) as usize % avatars.len()], 1)
    }

}


fn get_price(sales_account_data: &AvatarSales) -> u64{
    let x = sales_account_data.counter as f32;

    15 * (((100.0 + x.powf(0.6) + 270.0*( std::f32::consts::E.powf(0.08*x - 10.0)/(1.0+std::f32::consts::E.powf(0.08*x - 10.0)) )  )/15.0)) as u64  * 10e8 as u64
}

fn mint_nft(program_id: &Pubkey, accounts: &[AccountInfo], selected_rarity: Option<u8>) -> ProgramResult{
    
    let account_info_iter = &mut accounts.iter();


    let payer_account_info = next_account_info(account_info_iter)?;
    let payer_dsol_token_account_info = next_account_info(account_info_iter)?;
    let vault_reserve = next_account_info(account_info_iter)?;
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
    if *vault_reserve.key != vault::id() || dsol_mint::vault_associated_token_account() != *vault_dsol_token_account_info.key {
        Err(GlobalError::KeypairNotEqual)?
    }

    // msg!("Position 1");
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    
    // let instruction = Instructions::unpackinst(instruction_data)?;
    
    // let program_id = next_account_info(account_info_iter)?;
    let space: usize = 82;
    // msg!("Position before rent");
    let rent_lamports = Rent::get()?.minimum_balance(space);
    
    // msg!("Position id {:?}", program_id);
    // let sales_pda_seeds = &[b"dsol_avatar_sales_pda", &program_id.to_bytes()];
    
    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"dsol_avatar_sales_pda"], program_id);
    
    // msg!("Position {:?} {:?}", sales_pda, sales_pda_info.key);
    if &sales_pda != sales_pda_info.key{  //Checks both ownership and key
        msg!("sales_pda don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    // msg!("{:?}",&sales_pda_info.data);
    let mut sales_account_data: AvatarSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;

    if match StructId::decode(sales_account_data.struct_id)?{
        StructId::AvatarSales0_0_1 => {false}
        _ => {true}
    }{
        Err(GlobalError::InvalidStructId)?
    }
    // let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    let price = get_price(&sales_account_data);

    // msg!("Current timestamp: {:?}", current_timestamp);
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

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
    if &mint_authority_pda != mint_authority_info.key {
        msg!("Mint authorities pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    msg!("Initializing mint");
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
    
    msg!("Creating associated token account for mint");
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
    msg!("minting to payer account");

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

    // msg!("Hello_C");

    let mut creators = Vec::new();
    creators.push(Creator{address: *mint_authority_info.key, verified: true, share: 0});
    creators.push(Creator{address: *vault_reserve.key, verified:false, share:100});

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
    // msg!("Hello_C_0");
    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &mint_account_info.key.to_bytes()], &id());

    let (selected_uri, rarity) = select_uri(get_rand_num(current_timestamp as f32, mint_account_info.key, program_id), selected_rarity);


    if *metadata_pda_info.key != metadata_pda{
        msg!("Metadata pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    msg!("Hello_C_3");
    invoke_signed(
        &instruction::create_metadata_accounts(id(), *metadata_pda_info.key, *mint_account_info.key, *mint_authority_info.key, *payer_account_info.key, *mint_authority_info.key, "Dsol Avatar".to_string(), "Dsol_Av".to_string(), selected_uri.to_string(), Some(creators), 500, true, true),
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
    // msg!("Hello6");

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
        msg!("avatar data pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    msg!("creating avatar data account for storage");
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
    // msg!("Hello9");
    let avatar_pda_account_data = AvatarData{
        struct_id: StructId::encode(StructId::AvatarData0_0_1)?,
        date_created: current_timestamp,
        unlockable_date: unlockable_date,
        numeration: sales_account_data.counter,
        rarity: rarity,
        level: 0,
        xp: 0,
        rented_state: false,
        use_authority: payer_account_info.key.to_bytes(),
        rent_bump: 0
        
    };
    msg!("Serializing avatar data in pda");
    avatar_pda_account_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    // msg!("Hello_a");

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
    //             b"dsol_avatar_sales_pda",
    //             &program_id.to_bytes() as &[u8],
    //             &[_sales_pda_bump]
    //             ]
    //             ]
    // )?;

    // msg!("Hello_b");
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
    CreatePayerStorageAccount,
    CreateAccountRentSpace,
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
    let payer_storage_info = next_account_info(account_info_iter)?;

    let (payer_storage_pda, _) = Pubkey::find_program_address(&[b"payer_storage_location", &payer_account_info.key.to_bytes()], program_id);
    if payer_storage_pda != *payer_storage_info.key {
        msg!("Payer storage pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut payer_storage_data: PayerStorage = try_from_slice_unchecked(&payer_storage_info.data.borrow())?;
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"avatar_mint_authority_pda", &[mint_authority_bump]];
    if &mint_authority_pda != freeze_authority_info.key {
        msg!("mint authority pda does not match freeze_authority_info");
        Err(GlobalError::KeypairNotEqual)?
    } 


    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"dsol_avatar_sales_pda"], program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("sales pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let associated_token_address = get_associated_token_address(payer_account_info.key, mint_account_info.key);
    if *associated_account_info.key != associated_token_address{
        msg!("NFT associated token account infos do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    let associated_token_address_data = Account::unpack(&associated_account_info.data.borrow())?;
    if associated_token_address_data.amount != 1{
        msg!("NFT token balance is not equal to : 1");
        Err(GlobalError::KeypairNotEqual)?
    }
    
    if !payer_account_info.is_signer{
        msg!("Payer is not signer");
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("deserializing collection data");

    let mut collection_data: AvatarSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    msg!("collection data has been deserialized");
    if match StructId::decode(collection_data.struct_id)?{
        StructId::AvatarSales0_0_1=> {false}
        _ => {
                true
        }
    } {
        msg!("AvatarSales0_0_1 Struct Id's do not match");
        Err(GlobalError::InvalidStructId)?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        msg!("avatar data pda mismatch");
        Err(GlobalError::KeypairNotEqual)?
    }

    
    let container_unique_bump = payer_storage_data.account_storage_data;
    let (container_pda, container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &payer_account_info.key.to_bytes(), &container_unique_bump.to_be_bytes()], program_id);
    let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &payer_account_info.key.to_bytes(), &container_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *container_account_info.key != container_pda{
        msg!("container pda mismatch");
        Err(GlobalError::KeypairNotEqual)?
    }

    let space = 500;
    let lamports = Rent::get()?.minimum_balance(space as usize);
    invoke_signed(
        &system_instruction::create_account(&payer_account_info.key, &container_pda, lamports, space, &program_id),
        &[payer_account_info.clone(), container_account_info.clone()],
        &[container_seed]
    )?;



    let new_container_data = RentContainerData{
        struct_id: StructId::encode(StructId::RentContainerData0_0_1)?,
        mint_address: mint_account_info.key.to_bytes(),
        owner: payer_account_info.key.to_bytes(),
        state: true,
        renter: payer_account_info.key.to_bytes(),
        rent_price: rent_price,
        duration: duration,
        ending_date: current_timestamp as u64,
        earnings_percentage: earnings_percentage,
        cummulative_5week_hands: cummulative_5week_hands,
        required_rating: required_rating,
    };

    new_container_data.serialize(&mut &mut container_account_info.data.borrow_mut()[..])?;

    msg!("right before avatar_data deserialization");
    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

    if match StructId::decode(avatar_data.struct_id)?{
        StructId::AvatarData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    avatar_data.rented_state = true;
    avatar_data.use_authority = payer_account_info.key.to_bytes();
    avatar_data.rent_bump = container_unique_bump;
    // avatar_data.unlockable_date = current_timestamp + duration as u32;
    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    collection_data.rent_listings.push(
        RentListing{
            payer: payer_account_info.key.to_bytes(),
            bump: payer_storage_data.account_storage_data,
        }
    );

    payer_storage_data.rent_listings.push(
        RentListing{
            payer: payer_account_info.key.to_bytes(),
            bump: payer_storage_data.account_storage_data,
        }
    );


    payer_storage_data.account_storage_data += 1;
    payer_storage_data.serialize(&mut &mut payer_storage_info.data.borrow_mut()[..])?;
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


    if !admin_account_info.is_signer || *admin_account_info.key != Pubkey::from_str("2ZHc9QxDDaJwqNEFzpAGUrvxCWZSNnXSffHxV9hG2axp").unwrap(){
        msg!("Admin never signed transaction");
        Err(GlobalError::KeypairNotEqual)?
    }
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    if !payer_account_info.is_signer{
        msg!("Payer is not a signer");
        Err(GlobalError::KeypairNotEqual)?
    }


    let (account_rent_pda, _account_rent_pda_bump) = Pubkey::find_program_address(&[b"account_rent_space", &payer_account_info.key.to_bytes()], program_id);

    if account_rent_pda != *account_rent_space_info.key{
        msg!("account rent space pdas do not match");
        Err(ProgramError::Custom(1))?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        msg!("avatar data pda doesn't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    if match StructId::decode(avatar_data.struct_id)?{
        StructId::AvatarData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    
    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &mint_owner_info.key.to_bytes(), &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        msg!("rent container pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut rent_container_data:RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;
    if match StructId::decode(rent_container_data.struct_id)?{
        StructId::RentContainerData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    if rent_container_data.ending_date > current_timestamp as u64 || avatar_data.use_authority != rent_container_data.owner{
        msg!("Avatar already leased");
        Err(ProgramError::Custom(2))?
    }

    if rent_container_data.rent_price != 0.0 {
        invoke(
            &system_instruction::transfer(payer_account_info.key, &Pubkey::new_from_array(rent_container_data.owner),(rent_container_data.rent_price * 10e8) as u64),
            &[payer_account_info.clone(), mint_owner_info.clone()]
        )?;
    }

    avatar_data.unlockable_date = current_timestamp + rent_container_data.duration as u32;
    avatar_data.use_authority = payer_account_info.key.to_bytes();
    avatar_data.rented_state = true;
    rent_container_data.renter = payer_account_info.key.to_bytes();
    rent_container_data.ending_date = current_timestamp as u64 + rent_container_data.duration;
    let temp_account_rent_data:AccountRentSpace = try_from_slice_unchecked(&account_rent_space_info.data.borrow())?;

    if match StructId::decode(temp_account_rent_data.struct_id)?{
        StructId::AccountRentSpace0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    if temp_account_rent_data.state{
        msg!("Might need to end current rent session. Rent space already allocated.");
        Err(ProgramError::Custom(3))?
    }
    let account_rent_data = AccountRentSpace{
        struct_id: StructId::encode(StructId::AccountRentSpace0_0_1)?,
        state: true,
        nft_owner: rent_container_data.owner,
        mint_id: mint_account_info.key.to_bytes(),
        container_bump: avatar_data.rent_bump,
    };

    account_rent_data.serialize(&mut &mut account_rent_space_info.data.borrow_mut()[..])?;
    avatar_data.serialize(&mut &mut avatar_data_pda_info.data.borrow_mut()[..])?;
    rent_container_data.serialize(&mut &mut rent_container_pda_info.data.borrow_mut()[..])?;


    
    Ok(())
}

fn close_lease_listing(program_id: &Pubkey, accounts: &[AccountInfo]) -> Result<(), ProgramError> {

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
    let payer_storage_info = next_account_info(account_info_iter)?;

    let (payer_storage_pda, _) = Pubkey::find_program_address(&[b"payer_storage_location", &payer_account_info.key.to_bytes()], program_id);
    if payer_storage_pda != *payer_storage_info.key {
        msg!("Payer storage pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut payer_storage_data: PayerStorage = try_from_slice_unchecked(&payer_storage_info.data.borrow())?;
    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"avatar_mint_authority_pda"], program_id);
    if &mint_authority_pda != freeze_authority_info.key {
        msg!("mint authority not matching");
        Err(GlobalError::KeypairNotEqual)?
    } 

    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u64;

    let associated_token_address = get_associated_token_address(payer_account_info.key, mint_account_info.key);
    if *associated_account_info.key != associated_token_address{
        msg!("mint associated_token_address doesn't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];


    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id); 
    if avatar_data_pda_info.key != &avatar_data_pda{
        msg!("avatar data pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    if match StructId::decode(avatar_data.struct_id)?{
        StructId::AvatarData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &payer_account_info.key.to_bytes(),  &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        msg!("rent container pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut rent_container_data: RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;

    if match StructId::decode(rent_container_data.struct_id)?{
        StructId::RentContainerData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    if avatar_data.rented_state || rent_container_data.state{
        msg!("avatar rented stated doesn't seem to be valid");
        Err(ProgramError::Custom(1))?
    }

    if payer_account_info.key.to_bytes() != rent_container_data.owner || !payer_account_info.is_signer{
        msg!("payer is not signer, or payer does not match owneras of container data");
        Err(ProgramError::Custom(2))?
    }


    if  rent_container_data.renter != rent_container_data.owner || avatar_data.use_authority != rent_container_data.owner{
        if rent_container_data.ending_date > current_timestamp{
            msg!("rent ending date is greater than current time. Time hasn't reached yet");
            Err(ProgramError::Custom(3))?
        }
    }


    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"dsol_avatar_sales_pda"], program_id);

    if &sales_pda != sales_pda_info.key{
        msg!("sales pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
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

    let mut sales_account_data: AvatarSales = try_from_slice_unchecked(&sales_pda_info.data.borrow())?;
    if match StructId::decode(sales_account_data.struct_id)?{
        StructId::AvatarSales0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    sales_account_data.rent_listings.remove(
        sales_account_data.rent_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.bump == collection_unique_bump).expect("error finding position of sales_account_data listing")
    );

    payer_storage_data.rent_listings.remove(
        payer_storage_data.rent_listings.iter().position(|x| x.payer == payer_account_info.key.to_bytes() && x.bump == collection_unique_bump).expect("error finding position of sales_account_data listing")
    );
    
    payer_storage_data.serialize(&mut &mut payer_storage_info.data.borrow_mut()[..])?;
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
    let mint_owner_info = next_account_info(account_info_iter)?;


    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u32;

    if !payer_account_info.is_signer{
        Err(GlobalError::KeypairNotEqual)?
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
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut avatar_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;
    if match StructId::decode(avatar_data.struct_id)?{
        StructId::AvatarData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    
    let collection_unique_bump = avatar_data.rent_bump;
    let (container_pda, _container_pda_bump) = Pubkey::find_program_address( &[b"Rentable_marketplace", &mint_owner_info.key.to_bytes(), &collection_unique_bump.to_be_bytes()], program_id);
    // let container_seed: &[&[u8]] = &[b"Rentable_marketplace", &collection_unique_bump.to_be_bytes(), &[container_pda_bump]];

    if *rent_container_pda_info.key != container_pda{
        Err(GlobalError::KeypairNotEqual)?
    }

    let mut rent_container_data:RentContainerData = try_from_slice_unchecked(&rent_container_pda_info.data.borrow())?;
    if match StructId::decode(rent_container_data.struct_id)?{
        StructId::RentContainerData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    if avatar_data.use_authority != payer_account_info.key.to_bytes() || rent_container_data.renter != payer_account_info.key.to_bytes(){
        Err(ProgramError::Custom(2))?
    }

    avatar_data.unlockable_date = current_timestamp + rent_container_data.duration as u32;
    avatar_data.use_authority = rent_container_data.owner;
    rent_container_data.renter = rent_container_data.owner;
    avatar_data.rented_state = false;
    rent_container_data.state = false;
    rent_container_data.ending_date = current_timestamp as u64;
    let temp_account_rent_data:AccountRentSpace = try_from_slice_unchecked(&account_rent_space_info.data.borrow())?;

    if match StructId::decode(temp_account_rent_data.struct_id)?{
        StructId::AccountRentSpace0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    if !temp_account_rent_data.state{
        Err(ProgramError::Custom(3))?
    }
    let account_rent_data = AccountRentSpace{
        struct_id: StructId::encode(StructId::AccountRentSpace0_0_1)?,
        state: false,
        nft_owner: rent_container_data.owner,
        mint_id: mint_account_info.key.to_bytes(),
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
                let earnings_percentage =  data[4] as f32 + (data[5] as f32 / 100.0);
                if earnings_percentage >= 95.0{
                    Err(ProgramError::InvalidInstructionData)?
                }
                Ok(Self::LeaseAvatar{
                    duration: get_num_cnt(&data[1..4]) as u64 * 86400,
                    earnings_percentage:earnings_percentage,
                    rent_price: get_num_cnt(&data[6..9]) as f32 + (get_num_cnt(&data[9..12]) as f32 / 1000.0),
                    cummulative_5week_hands: get_num_cnt(&data[12..15]),
                    required_rating: get_num_cnt(&data[15..18])
                })
            }
            6 => {Ok(Self::RentAvatar)}
            7 => {Ok(Self::CloseLeaseListing)}
            8 => {Ok(Self::EndRent)}
            9 => {Ok(Self::CreateVaultDsolTokenAccount)}
            10 => {Ok(Self::CreatePayerStorageAccount)}
            11 => {Ok(Self::CreateAccountRentSpace)}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn create_sales_account(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let sales_pda_info = next_account_info(account_info_iter)?;
    
    if !payer_account_info.is_signer || payer_account_info.key != &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(GlobalError::KeypairNotEqual)?
    }

    // let sales_pda_seeds = &[b"dsol_avatar_sales_pda", &program_id.to_bytes() as &[u8]];

    let (sales_pda, _sales_pda_bump) = Pubkey::find_program_address(&[b"dsol_avatar_sales_pda"], program_id);

    if &sales_pda != sales_pda_info.key{
        Err(GlobalError::KeypairNotEqual)?
    }



    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &sales_pda_info.key,
            Rent::get()?.minimum_balance(8000),
            8000,
            &program_id,
        ),
        &[payer_account_info.clone(), sales_pda_info.clone()],
        &[
            &[        
                b"dsol_avatar_sales_pda",
                &[_sales_pda_bump]
                ]
                ]
    )?;


    let sales_account_data = AvatarSales{
        struct_id: StructId::encode(StructId::AvatarSales0_0_1)?,
        vault_total : 1.0,
        counter :  1,
        rent_listings: Vec::new(),
    };

    sales_account_data.serialize(&mut &mut sales_pda_info.data.borrow_mut()[..])?;

    Ok(())
}



fn create_payer_storage_account(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let payer_storage_info = next_account_info(account_info_iter)?;
    
    if !payer_account_info.is_signer{
        Err(GlobalError::KeypairNotEqual)?
    }
    let (payer_storage_pda, storage_bump) = Pubkey::find_program_address(&[b"payer_storage_location", &payer_account_info.key.to_bytes()], program_id);
    if payer_storage_pda != *payer_storage_info.key {
        msg!("Payer storage pdas do not match");
        Err(GlobalError::KeypairNotEqual)?
    }


    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &payer_storage_info.key,
            Rent::get()?.minimum_balance(200),
            8000,
            &program_id,
        ),
        &[payer_account_info.clone(), payer_storage_info.clone()],
        &[
            &[b"payer_storage_location", &payer_account_info.key.to_bytes(), &[storage_bump]]
                ]
    )?;


    let payer_storage_data = PayerStorage{
        account_storage_data: 0,
        rent_listings: Vec::new(),
    };

    payer_storage_data.serialize(&mut &mut payer_storage_info.data.borrow_mut()[..])?;

    Ok(())
}

fn create_account_rent_space(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let account_rent_space_info = next_account_info(account_info_iter)?;
    
    if !payer_account_info.is_signer{
        Err(GlobalError::KeypairNotEqual)?
    }
    let (account_rent_pda, account_rent_pda_bump) = Pubkey::find_program_address(&[b"account_rent_space", &payer_account_info.key.to_bytes()], program_id);

    if account_rent_pda != *account_rent_space_info.key{
        msg!("account rent space pdas do not match");
        Err(ProgramError::Custom(1))?
    }

    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &account_rent_space_info.key,
            Rent::get()?.minimum_balance(200),
            8000,
            &program_id,
        ),
        &[payer_account_info.clone(), account_rent_space_info.clone()],
        &[
            &[b"account_rent_space", &payer_account_info.key.to_bytes(), &[account_rent_pda_bump]]
                ]
    )?;


    let account_storage_data = AccountRentSpace{
        struct_id: StructId::encode(StructId::AccountRentSpace0_0_1)?,
        nft_owner: payer_account_info.key.to_bytes(),
        mint_id: payer_account_info.key.to_bytes(),
        container_bump: 0,
        state: false,
    };

    account_storage_data.serialize(&mut &mut account_rent_space_info.data.borrow_mut()[..])?;

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
    //     Err(GlobalError::KeypairNotEqual)?
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
        Err(GlobalError::KeypairNotEqual)?
    }

    let avatar_data_pda_seed: &[&[u8]; 2] = &[
        b"avatar_data_pda",
        &mint_account_info.key.to_bytes(),
    ];
    let avatar_pda_account_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

    if match StructId::decode(avatar_pda_account_data.struct_id)?{
        StructId::AvatarData0_0_1=> {false}
        _ => {
                true
        }
    } {
        Err(GlobalError::InvalidStructId)?
    }

    let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
    if avatar_data_pda_info.key != &avatar_data_pda{
        Err(GlobalError::KeypairNotEqual)?
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
        Err(GlobalError::KeypairNotEqual)?
    }
    Ok(())
}

fn claim_xp(program_id: &Pubkey, accounts: &[AccountInfo], xp_claims: Vec<u32>) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    
    let payer_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer || payer_account_info.key !=  &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
        Err(GlobalError::KeypairNotEqual)?
    }

    for to_increase_by in 0..xp_claims.len(){

        let mint_account_info = next_account_info(account_info_iter)?;
        let avatar_data_pda_info = next_account_info(account_info_iter)?;

        let avatar_data_pda_seed: &[&[u8]; 2] = &[
            b"avatar_data_pda",
            &mint_account_info.key.to_bytes(),
        ];
        let mut avatar_pda_account_data: AvatarData = try_from_slice_unchecked(&avatar_data_pda_info.data.borrow())?;

        if match StructId::decode(avatar_pda_account_data.struct_id)?{
            StructId::AvatarData0_0_1=> {false}
            _ => {
                    true
            }
        } {
            Err(GlobalError::InvalidStructId)?
        }

        let (avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
        if avatar_data_pda_info.key != &avatar_data_pda{
            Err(GlobalError::KeypairNotEqual)?
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

        if match StructId::decode(curr_avatar_pda_account_data.struct_id)?{
            StructId::AvatarData0_0_1=> {false}
            _ => {
                    true
            }
        } {
            Err(GlobalError::InvalidStructId)?
        }

        let (curr_avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
        if curr_avatar_data_pda_info.key != &curr_avatar_data_pda{
            msg!("Error_Bn_1");
            Err(GlobalError::KeypairNotEqual)?
        }
        if curr_avatar_pda_account_data.rarity != rarity{
            msg!("Error_Bn_2");
            Err(GlobalError::KeypairNotEqual)?
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

        if *program_id != avatar::id(){
            Err(ProgramError::IncorrectProgramId)?
        }

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
            InstructionEnum::CreatePayerStorageAccount => {create_payer_storage_account(program_id, accounts)},
            InstructionEnum::CreateAccountRentSpace => {create_account_rent_space(program_id, accounts)},
        }
}

#[cfg(test)]
mod tests {
    // use std::str::FromStr;

    // use solana_program::pubkey::Pubkey;

    use crate::{AvatarSales, get_price, get_num_cnt, get_rand_num};
    // use global_repo::StructId;
    use solana_program::{pubkey::Pubkey, msg};
    use std::str::FromStr;

    #[test]
    fn testing_get_price() {
        // let mut x: Option<&Pubkey> = Some(&Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap());

        let sales_account_data = AvatarSales{
            struct_id: 0,
            vault_total :0.0,
            counter :0,
            rent_listings: Vec::new(),
        };
        assert_eq!(get_price(&sales_account_data), 90*10e8 as u64);
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