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
    instruction::{Instruction, AccountMeta},
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
    program_error::ProgramError, program_pack::Pack,
};
use spl_associated_token_account::{create_associated_token_account, get_associated_token_address};
use spl_token::{instruction::*,
                state::{Account},
                };
use metaplex_token_metadata::{instruction, state::{Creator}};
use metaplex_token_metadata::id;

extern crate global_repo;

use global_repo::{
    governor, error::GlobalError,
};
// use solana_sdk::{
//     compute_budget::ComputeBudgetInstruction};
entrypoint!(process_instructions);


// #[derive(BorshDeserialize, BorshSerialize)]
// struct RequestUnits {
//     /// Units to request
//     units: u32,
//     /// Additional fee to add
//     additional_fee: u32,
// }

#[derive(BorshSerialize, BorshDeserialize)]
struct TableSales{
     vault_total: f32,
     counter: u32,
}

#[derive(BorshDeserialize, BorshSerialize)]
struct Tableloc{
    payer_bump: u32,
    payer_pubkey: [u8;32],
}

#[derive(BorshDeserialize, BorshSerialize)]
struct PendingTables{
    tables: Vec<Tableloc>,
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
}
#[derive(BorshSerialize, BorshDeserialize)]
struct ProposalNumGovernors{
    num_of_governors: u8,
} 
#[derive(BorshSerialize, BorshDeserialize)]
struct ProposalLockGovernor{
    time: u32,
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

// fn get_num_cnt(arr: &[u8]) -> u32 {
//     arr[0] as u32 * arr[1] as u32 + arr[2] as u32
// }

mod compute_budget{
    solana_program::declare_id!("ComputeBudget111111111111111111111111111111");
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


fn get_price(sales_account_data: &TableSales) -> u64{
    let x = sales_account_data.counter as f32;
    15 * (((100.0 + x.powf(0.6) + 270.0*( std::f32::consts::E.powf(0.08*x - 10.0)/(1.0+std::f32::consts::E.powf(0.08*x - 10.0)) )  )/15.0)) as u64  * 10e8 as u64
}

fn mint_table(program_id: &Pubkey, accounts: &[AccountInfo], payer_bump: u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    
    let payer_account_info = next_account_info(account_info_iter)?;
    let table_data_pda_info = next_account_info(account_info_iter)?;
    let pending_tables_pda_info = next_account_info(account_info_iter)?;
    let table_final_data_pda_info = next_account_info(account_info_iter)?;

    let payer_table_associated_account_info = next_account_info(account_info_iter)?;
    let payer_table_metadata_pda_info = next_account_info(account_info_iter)?;
    let vault_account_info = next_account_info(account_info_iter)?;
    let table_mint_account_info = next_account_info(account_info_iter)?;
    let table_mint_authority_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;


    
    let table_data_pda_seed: &[&[u8]; 3] = &[
        b"table_data_pda",
        &payer_account_info.key.to_bytes(),
        &payer_bump.to_be_bytes()
    ];
    let (table_data_pda, _table_data_pda_bump) = Pubkey::find_program_address(table_data_pda_seed, program_id); 
    if table_data_pda_info.key != &table_data_pda{
        msg!("table data pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }


    let (pending_tables_pda, _pending_tables_bump) = Pubkey::find_program_address(&[b"pending_tables"], program_id);


    if *pending_tables_pda_info.key != pending_tables_pda {
        msg!("Pending tables pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }
    let mut table_pda_data: TableData = try_from_slice_unchecked(&table_data_pda_info.data.borrow())?;

    if table_pda_data.creators.len() as u8 != table_pda_data.num_creators {
        Err(GlobalError::TooManySigningGovernors)?
    }

    if table_pda_data.minted{
        Err(GlobalError::TableAlreadyMinted)?
    }

    let mut pending_tables: PendingTables = try_from_slice_unchecked(&pending_tables_pda_info.data.borrow())?;

    pending_tables.tables.remove(pending_tables.tables.iter().position(|x| x.payer_pubkey == payer_account_info.key.to_bytes() && x.payer_bump == payer_bump).expect("Catstrophe, couldn't find in pending tables the requested table data"));
    // let mut cnt:usize = 0;
    // for tableloc in pending_tables.tables{
    //     if tableloc.payer_pubkey == payer_account_info.key.to_bytes() && tableloc.payer_bump == payer_bump {
    //         pending_tables.tables.remove(cnt);
    //         break;
    //     }
    //     cnt += 1;
    // }




    let decimals = 0;
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    let space: usize = 82;
    let rent_lamports = Rent::get()?.minimum_balance(space);
    msg!("Hello");
    invoke(
        &system_instruction::create_account(
            &payer_account_info.key,
            &table_mint_account_info.key,
            rent_lamports,
            space as u64,
            &token_program_info.key,
        ),
        &[payer_account_info.clone(), table_mint_account_info.clone()],
    )?;
    msg!("Hello2");

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(&[b"table_mint_authority_pda"], program_id);
    let signers_seeds: &[&[u8]; 2] = &[b"table_mint_authority_pda", &[mint_authority_bump]];
    if &mint_authority_pda != table_mint_authority_info.key {
        Err(ProgramError::InvalidAccountData)?
    }

    invoke(
        &initialize_mint(
            &token_program_info.key,
            &table_mint_account_info.key,
            &table_mint_authority_info.key,
            Some(&table_mint_authority_info.key),
            decimals,
        )?,
        &[
            table_mint_account_info.clone(),
            rent_account_info.clone(),
            // token_program_info.clone(),
        ],
    )?;
    msg!("Hello3");

    invoke(
        &create_associated_token_account(
            payer_account_info.key,
            payer_account_info.key,
            table_mint_account_info.key,
        ),
        &[
            payer_account_info.clone(),
            payer_table_associated_account_info.clone(),
            payer_account_info.clone(),
            table_mint_account_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ],
    )?;
    msg!("Hello4");

    invoke_signed(
        &mint_to(
            &token_program_info.key,
            &table_mint_account_info.key,
            &payer_table_associated_account_info.key,
            &table_mint_authority_info.key,
            &[],
            1,
        )?,
        &[
            table_mint_account_info.clone(),
            payer_table_associated_account_info.clone(),
            table_mint_authority_info.clone(),
        ],
        &[signers_seeds],
    )?;

    msg!("Hello_C");

    let mut creators = Vec::new();
    creators.push(Creator{address: *table_mint_authority_info.key, verified: true, share: 0});
    creators.push(Creator{address: *vault_account_info.key, verified:false, share:100});

    msg!("Hello_C_0");
    let (payer_table_metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &table_mint_account_info.key.to_bytes()], &id());

    let (selected_uri, rarity) = select_uri(get_rand_num(current_timestamp as f32, table_mint_account_info.key, program_id), None);

    msg!("Hello_C_2 {:?} {:?}", payer_table_metadata_pda, payer_table_metadata_pda_info.key);

    if *payer_table_metadata_pda_info.key != payer_table_metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello_C_3");
    

    invoke_signed(
        &instruction::create_metadata_accounts(
            id(), 
            *payer_table_metadata_pda_info.key, 
            *table_mint_account_info.key, 
            *table_mint_authority_info.key, 
            *payer_account_info.key, 
            *table_mint_authority_info.key, 
            "DSOL Table".to_string(), 
            "DSOLT".to_string(), 
            selected_uri.to_string(), 
            Some(creators), 
            500, 
            true, 
            true),
        &[
            payer_table_metadata_pda_info.clone(),
            table_mint_account_info.clone(),
            table_mint_authority_info.clone(),
            payer_account_info.clone(),
            table_mint_authority_info.clone(),
            system_account_info.clone(),
            rent_account_info.clone(),
        ],
        &[signers_seeds]
    )?;

    msg!("Hello_C_4");

    invoke_signed(
        &instruction::update_primary_sale_happened_via_token(
            id(), 
            *payer_table_metadata_pda_info.key, 
            *payer_account_info.key, 
            *payer_table_associated_account_info.key),
        &[
            payer_table_metadata_pda_info.clone(),
            payer_account_info.clone(),
            payer_table_associated_account_info.clone()
            ],
        &[signers_seeds]
    )?;

    msg!("Hello5");

    invoke_signed(
        &set_authority(
            &token_program_info.key,
            &table_mint_account_info.key,
            None,
            AuthorityType::MintTokens,
            &table_mint_authority_info.key,
            &[],
        )?,
        &[table_mint_account_info.clone(), table_mint_authority_info.clone()],
        &[signers_seeds],
    )?;

    let table_final_data_pda_seed: &[&[u8]; 2] = &[
        b"table_data_pda",
        &table_mint_account_info.key.to_bytes(),
    ];
    let (table_final_data_pda, table_final_data_pda_bump) = Pubkey::find_program_address(table_final_data_pda_seed, program_id); 
    if table_final_data_pda_info.key != &table_final_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello8");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &table_final_data_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), table_final_data_pda_info.clone()],
        &[
            &[        
                b"table_data_pda",
                &table_mint_account_info.key.to_bytes(),
                &[table_final_data_pda_bump]
                ]
                ]
    )?;
    msg!("Hello9");
    table_pda_data.rarity = rarity;
    table_pda_data.minted = true;
    table_pda_data.serialize(&mut &mut table_final_data_pda_info.data.borrow_mut()[..])?;
    table_pda_data.serialize(&mut &mut table_data_pda_info.data.borrow_mut()[..])?;

    Ok(())

}

fn init_mint(program_id: &Pubkey, accounts: &[AccountInfo], governor_reward: u32, payer_bump: u32) -> ProgramResult{
    
    let account_info_iter = &mut accounts.iter();


    let payer_account_info = next_account_info(account_info_iter)?;
    let payer_dsol_token_account_info = next_account_info(account_info_iter)?;
    let payer_governor_token_account_info = next_account_info(account_info_iter)?;
    let payer_table_data_pda_info = next_account_info(account_info_iter)?;
    let vault_pda_dsol_token_account_info = next_account_info(account_info_iter)?;
    let table_sales_pda_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let pending_tables_pda_info = next_account_info(account_info_iter)?;
    let main_vault_associated_info = next_account_info(account_info_iter)?;
    let governor_data_pda_info = next_account_info(account_info_iter)?;
    let governor_mint_account_info = next_account_info(account_info_iter)?;
    // let associated_token_program_info = next_account_info(account_info_iter)?;
    // TODO: At the end we shall have to have a unique main vault and use his address through out our contracts


    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &governor_mint_account_info.key.to_bytes(),
    ];
    let (governor_data_pda, _governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, &governor::id()); 
    if governor_data_pda_info.key != &governor_data_pda{
        Err(ProgramError::InvalidAccountData)?
    }


    let (pending_tables_pda, _pending_tables_bump) = Pubkey::find_program_address(&[b"pending_tables"], program_id);


    if *pending_tables_pda_info.key != pending_tables_pda {
        msg!("Pending tables pdas don't match");
        Err(GlobalError::KeypairNotEqual)?
    }

    msg!("Position {:?}", payer_governor_token_account_info.key);
    let payer_governor_token_data = Account::unpack(&payer_governor_token_account_info.data.borrow())?;
    msg!("Checkpoint reached");
    if payer_governor_token_data.is_frozen() {
        msg!("Account Still Frozen, check it out");
        Err(ProgramError::InvalidAccountData)?
    }

    if payer_governor_token_data.amount != 1  {
        Err(ProgramError::InsufficientFunds)?
    }

    // invoke(
    //     &Instruction::new_with_borsh(
    //         compute_budget::id(),
    //         &RequestUnits{
    //             units: 400000,
    //             additional_fee: (0.01e9) as u32
    //         },
    //         vec![],
    //     ),
    //     &[]
    // )?;
    msg!("Position 2");

    // let decimals = 0;
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    // let instruction = Instructions::unpackinst(instruction_data)?;
    
    // let program_id = next_account_info(account_info_iter)?;
    // let space: usize = 82;
    // let rent_lamports = Rent::get()?.minimum_balance(space);
    // let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes()];
    msg!("just another checkpoint");
    let (table_sales_pda, _table_sales_pda_bump) = Pubkey::find_program_address(&[b"table_sales_pda"], program_id);
    msg!("Position {:?} {:?}", table_sales_pda, table_sales_pda_info.key);    
    if &table_sales_pda != table_sales_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("{:?}",&table_sales_pda_info.data);
    let mut sales_account_data: TableSales = try_from_slice_unchecked(&table_sales_pda_info.data.borrow())?;
    // let mut sales_account_data = Sales{vault_total:1.0, counter: 1};
    let unitary = sales_account_data.vault_total * 1.25 / sales_account_data.counter as f32;

    let price = get_price(&sales_account_data);

    msg!("Current timestamp: {:?}", current_timestamp);

    let proposal_num_governors = ProposalNumGovernors{
        num_of_governors: 5
    };


    let (vault_pda, _vault_pda_bump) = Pubkey::find_program_address(&[b"Dsol_vault_tables"], program_id);
    let vault_pda_associated = get_associated_token_address(&vault_pda, &global_repo::dsol_mint::id());


    if vault_pda_associated != *vault_pda_dsol_token_account_info.key{
        msg!("vault_pdas not equal");
        Err(GlobalError::KeypairNotEqual)?
    }
    
    let main_vault_assoc = get_associated_token_address(&global_repo::vault::id(), &global_repo::dsol_mint::id());
    if *main_vault_associated_info.key != main_vault_assoc {
        msg!("main_vaults not equal");
        Err(GlobalError::KeypairNotEqual)?
    }

    // let rent = Rent::from_account_info(rent_account_info)?;
    msg!("Transfer DSOL token");
    invoke(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &payer_dsol_token_account_info.key,
            &main_vault_assoc,
            &payer_account_info.key,
            &[],
            price
        )?,
        &[payer_dsol_token_account_info.clone(), main_vault_associated_info.clone(), payer_account_info.clone()]
    )?;
    msg!("Suprise");
    invoke(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &payer_dsol_token_account_info.key,
            &vault_pda_dsol_token_account_info.key,
            &payer_account_info.key,
            &[],
             proposal_num_governors.num_of_governors as u64 * governor_reward as u64 
        )?,
        &[payer_dsol_token_account_info.clone(), vault_pda_dsol_token_account_info.clone(), payer_account_info.clone()]
    )?;
    
    msg!("Hello7");


    let table_data_pda_seed: &[&[u8]; 3] = &[
        b"table_data_pda",
        &payer_account_info.key.to_bytes(),
        &payer_bump.to_be_bytes()
    ];
    let (table_data_pda, table_data_pda_bump) = Pubkey::find_program_address(table_data_pda_seed, program_id); 
    if payer_table_data_pda_info.key != &table_data_pda{
        msg!("{:?} < ---- > {:?}", payer_table_data_pda_info.key, table_data_pda);
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("Hello8");
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &payer_table_data_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), payer_table_data_pda_info.clone()],
        &[
            &[        
                b"table_data_pda",
                &payer_account_info.key.to_bytes(),
                &payer_bump.to_be_bytes(),
                &[table_data_pda_bump]
            ]
        ]
    )?;

    msg!("Hello9");
    let governor_data: GovernorData = try_from_slice_unchecked(&governor_data_pda_info.data.borrow())?; //confirming governor is ours, via deserialization of struct


    let table_pda_account_data = TableData{
        id: sales_account_data.counter,
        rarity: 10,
        date_created: current_timestamp,
        creators: Vec::new(),
        num_creators: proposal_num_governors.num_of_governors,
        governor_reward: governor_reward,
        minted: false,
    };

    if governor_data.unlockable_date >= current_timestamp { //Confirming 
        Err(GlobalError::NotUnlockableDate)?
    }
    table_pda_account_data.serialize(&mut &mut payer_table_data_pda_info.data.borrow_mut()[..])?;
    msg!("Hello_a");

    sales_account_data.vault_total += unitary;
    sales_account_data.counter += 1; 

    let mut pending_tables: PendingTables = try_from_slice_unchecked(&pending_tables_pda_info.data.borrow())?;
    pending_tables.tables.push(Tableloc{payer_bump:payer_bump, payer_pubkey: payer_account_info.key.to_bytes()});

    pending_tables.serialize(&mut &mut pending_tables_pda_info.data.borrow_mut()[..])?;
    sales_account_data.serialize(&mut &mut table_sales_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn sign_table_mint(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.into_iter();

    let payer_dsol_token_account_info = next_account_info(account_info_iter)?;
    let payer_governor_token_account_info = next_account_info(account_info_iter)?;
    let governor_mint_account_info = next_account_info(account_info_iter)?;
    let governor_mint_authority_info = next_account_info(account_info_iter)?;
    let payer_governor_data_pda_info = next_account_info(account_info_iter)?;
    // let table_associated_account_info = next_account_info(account_info_iter)?;
    let table_data_pda_info = next_account_info(account_info_iter)?;
    let vault_pda_account_info = next_account_info(account_info_iter)?;
    let vault_pda_dsol_token_account_info = next_account_info(account_info_iter)?;
    // let table_mint_account_info = next_account_info(account_info_iter)?;
    // let table_mint_authority_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let authorizer_account_info = next_account_info(account_info_iter)?;

    let payer_governor_token_account = Account::unpack(&payer_governor_token_account_info.data.borrow())?;
    let mut table_data_pda_data: TableData = try_from_slice_unchecked(&table_data_pda_info.data.borrow())?;
    msg!("Reached checkpoint 1");
    if payer_governor_token_account.is_frozen(){
        msg!("Governor is frozen");
        Err(ProgramError::InvalidInstructionData)?
    }

    if table_data_pda_data.creators.len() >= table_data_pda_data.num_creators.into() {
        msg!("Table already has enough signatures");
        Err(ProgramError::InvalidInstructionData)?
    }


    table_data_pda_data.creators.push(payer_governor_token_account_info.key.to_bytes());

    let mut governor_data: GovernorData = try_from_slice_unchecked(&payer_governor_data_pda_info.data.borrow())?;
    msg!("Reached checkpoint 2");
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp as u32;
    let proposal_lock_governor = ProposalLockGovernor{
        time: 4 * 30 * 86400,
    };


    let governor_data_pda_seed: &[&[u8]; 2] = &[
        b"governor_data_pda",
        &governor_mint_account_info.key.to_bytes(),
    ];
    let (governor_data_pda, _governor_data_pda_bump) = Pubkey::find_program_address(governor_data_pda_seed, &governor::id()); 
    if payer_governor_data_pda_info.key != &governor_data_pda{
        msg!("Governor pdas don't match");
        Err(ProgramError::InvalidAccountData)?
    }

    governor_data.unlockable_date = current_timestamp + proposal_lock_governor.time;

    let (authorizer_pda, authorizer_pda_bump) = Pubkey::find_program_address(&[b"authorizer_pda"], program_id);
    let authorizer_signers_seeds: &[&[u8]; 2] = &[b"authorizer_pda", &[authorizer_pda_bump]];
    if &authorizer_pda != authorizer_account_info.key {
        msg!("authorizers do not match");
        Err(ProgramError::InvalidAccountData)?
    }

    let account_metas = vec![
            AccountMeta::new_readonly(authorizer_pda, true),
            AccountMeta::new_readonly(*token_program_info.key, false),
            AccountMeta::new(*payer_governor_token_account_info.key, false),
            AccountMeta::new_readonly(*governor_mint_account_info.key, false),
            AccountMeta::new_readonly(*governor_mint_authority_info.key, false),
        ];

    invoke_signed(
        &Instruction::new_with_bincode(
            governor::id(),
            &[5],
            account_metas,
        ),
        &[
            authorizer_account_info.clone(),
            token_program_info.clone(),
            payer_governor_token_account_info.clone(),
            governor_mint_account_info.clone(),
            governor_mint_authority_info.clone()
        ],
        &[authorizer_signers_seeds],

    )?;
     
    msg!("Reached checkpoint 3");
    let (vault_pda, vault_pda_bump) = Pubkey::find_program_address(&[b"Dsol_vault_tables"], program_id);

    if vault_pda != *vault_pda_account_info.key{
        Err(GlobalError::KeypairNotEqual)?
    }

    invoke_signed(
        &spl_token::instruction::transfer(
            &token_program_info.key,
            &vault_pda_dsol_token_account_info.key,
            &payer_dsol_token_account_info.key,
            &vault_pda_account_info.key,
            &[],
            table_data_pda_data.governor_reward as u64 
        )?,
        &[ vault_pda_dsol_token_account_info.clone(), payer_dsol_token_account_info.clone(), vault_pda_account_info.clone()],
        &[&[b"Dsol_vault_tables", &[vault_pda_bump]]]
    )?;
    msg!("Reached checkpoint 5");
    if table_data_pda_data.creators.len() as u8 > table_data_pda_data.num_creators {
        Err(GlobalError::TooManySigningGovernors)?
    }

    table_data_pda_data.serialize(&mut &mut table_data_pda_info.data.borrow_mut()[..])?;

    Ok(())
}
#[derive(Debug, BorshDeserialize)]
enum InstructionEnum{
    InitTable{governor_reward: u32, payer_bump: u32},
    SignTableMint,
    CreateTableSalesAccount,
    BurnNFTs{rarity: u8},
    MintTable{payer_bump: u32},
}

impl InstructionEnum{
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        let instruction_des:InstructionEnum = try_from_slice_unchecked(data)?;
        Ok(match instruction_des{
            InstructionEnum::InitTable{governor_reward, payer_bump} => {Self::InitTable{governor_reward:governor_reward, payer_bump:payer_bump}}
            InstructionEnum::SignTableMint => {Self::SignTableMint}
            InstructionEnum::CreateTableSalesAccount => {Self::CreateTableSalesAccount}
            InstructionEnum::BurnNFTs{rarity} => {Self::BurnNFTs{rarity:rarity}}
            InstructionEnum::MintTable{payer_bump} => {Self::MintTable{payer_bump:payer_bump}}
            // _ => {Err(ProgramError::InvalidInstructionData)}
        })
    }
}

fn create_table_sales_account(program_id: &Pubkey, accounts: &[AccountInfo] ) -> ProgramResult{

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let table_sales_pda_info = next_account_info(account_info_iter)?;
    let pending_tables_pda_info = next_account_info(account_info_iter)?;
    let vault_pda_dsol_token_account_info = next_account_info(account_info_iter)?;
    let vault_account_info = next_account_info(account_info_iter)?;
    let main_vault_associated_info = next_account_info(account_info_iter)?;
    let main_vault_info = next_account_info(account_info_iter)?;
    let mint_info = next_account_info(account_info_iter)?;
    let system_account_info = next_account_info(account_info_iter)?;
    let token_program_info = next_account_info(account_info_iter)?;
    let rent_account_info = next_account_info(account_info_iter)?;

    let (pending_tables_pda, pending_tables_bump) = Pubkey::find_program_address(&[b"pending_tables"], program_id);
    msg!("Checkpoint01: {:?} --- {:?}", pending_tables_pda, pending_tables_pda_info.key);
    if pending_tables_pda != *pending_tables_pda_info.key{
        Err(GlobalError::KeypairNotEqual)?
    }
    // TODO: At the end we shall have to have a unique main payer and use his address through out our contracts
    
    // if !payer_account_info.is_signer || payer_account_info.key != &Pubkey::from_str("2ASw3tjK5bSxQxFEMsM6J3DnBozNh7drVErSwc7AtzJv").unwrap(){
    //     Err(ProgramError::InvalidAccountData)?
    // }

    // let sales_pda_seeds = &[b"sales_pda", &program_id.to_bytes() as &[u8]];

    let (table_sales_pda, table_sales_pda_bump) = Pubkey::find_program_address(&[b"table_sales_pda"], program_id);
    msg!("Checkpoint02");
    if &table_sales_pda != table_sales_pda_info.key{
        Err(GlobalError::KeypairNotEqual)?
    }

    let (vault_pda, _vault_pda_bump) = Pubkey::find_program_address(&[b"Dsol_vault_tables"], program_id);
    let vault_pda_associated = get_associated_token_address(&vault_pda, &global_repo::dsol_mint::id());

    msg!("Checkpoint03");
    if vault_pda_associated != *vault_pda_dsol_token_account_info.key{
        Err(GlobalError::KeypairNotEqual)?
    }
    
    let main_vault_assoc = get_associated_token_address(&global_repo::vault::id(), &global_repo::dsol_mint::id());
    msg!("Checkpoint04");
    if *main_vault_associated_info.key != main_vault_assoc {
        Err(GlobalError::KeypairNotEqual)?
    }


    msg!("Checkpoint1");
    invoke(
        &spl_associated_token_account::create_associated_token_account(
            payer_account_info.key, 
            vault_account_info.key,
            &global_repo::dsol_mint::id(),
        ),
        &[
            payer_account_info.clone(),
            vault_pda_dsol_token_account_info.clone(),
            vault_account_info.clone(),
            mint_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ]
    )?;
    msg!("Checkpoint2");
    invoke(
        &spl_associated_token_account::create_associated_token_account(
            payer_account_info.key, 
            main_vault_info.key,
            &global_repo::dsol_mint::id(),
        ),
        &[
            payer_account_info.clone(),
            main_vault_associated_info.clone(),
            main_vault_info.clone(),
            mint_info.clone(),
            system_account_info.clone(),
            token_program_info.clone(),
            rent_account_info.clone(),
        ]
    )?;

    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &table_sales_pda_info.key,
            Rent::get()?.minimum_balance(200),
            200,
            &program_id,
        ),
        &[payer_account_info.clone(), table_sales_pda_info.clone()],
        &[
            &[        
                b"table_sales_pda",
                &[table_sales_pda_bump]
                ]
                ]
    )?;

    
    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &pending_tables_pda_info.key,
            Rent::get()?.minimum_balance(2000),
            2000,
            &program_id,
        ),
        &[payer_account_info.clone(), pending_tables_pda_info.clone()],
        &[
            &[        
                b"pending_tables",
                &[pending_tables_bump]
                ]
                ]
    )?;

    let table_sales_account_data = TableSales{
        vault_total : 1.0,
        counter :  1
    };

    let tables: Vec<Tableloc> = Vec::new();
    let pending_tables = PendingTables{
        tables: tables
    };

    pending_tables.serialize(&mut &mut pending_tables_pda_info.data.borrow_mut()[..])?;
    table_sales_account_data.serialize(&mut &mut table_sales_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

// fn num_to_burn(rarity:u8) -> Result<u8, ProgramError>{
//  // Ok(255)
//     match rarity{
//         1=>{Ok(3)}
//         2=>{Ok(2)}
//         3=>{Ok(2)}
//         4=>{Ok(2)}
//         5=>{Ok(4)}
//         6=>{Ok(10)}
//         _=>{Err(ProgramError::InvalidInstructionData)?}
//     }
// }

fn burn_nft(_program_id: &Pubkey, _accounts: &[AccountInfo], _rarity: u8)-> ProgramResult{
    Ok(())

//     let account_info_iter = &mut accounts.iter();


//     let payer_account_info = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let token_program_info = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
//     let _ = next_account_info(account_info_iter)?;
    

//     let num_to_burn = match num_to_burn(rarity){
//         Ok(num) => { num }
//         Err(_) => {Err(ProgramError::InvalidInstructionData)?}
//     };

//     msg!("Hellow_Bn_1");
//     for _num_burned in 0..num_to_burn{

//         let curr_associated_account_info = next_account_info(account_info_iter)?;
//         let curr_table_mint_account_info = next_account_info(account_info_iter)?;
//         let curr_payer_table_data_pda_info = next_account_info(account_info_iter)?;


//         let avatar_data_pda_seed: &[&[u8]; 2] = &[
//             b"avatar_data_pda",
//             &curr_table_mint_account_info.key.to_bytes(),
//         ];
//         let curr_avatar_pda_account_data: TableData = try_from_slice_unchecked(&curr_payer_table_data_pda_info.data.borrow())?;
//         let (curr_avatar_data_pda, _avatar_data_pda_bump) = Pubkey::find_program_address(avatar_data_pda_seed, program_id);
//         if curr_payer_table_data_pda_info.key != &curr_avatar_data_pda{
//             msg!("Error_Bn_1");
//             Err(ProgramError::InvalidAccountData)?
//         }
//         if curr_avatar_pda_account_data.rarity != rarity{
//             msg!("Error_Bn_2");
//             Err(ProgramError::InvalidAccountData)?
//         }
//         invoke(
//             &burn(token_program_info.key, curr_associated_account_info.key, curr_table_mint_account_info.key, payer_account_info.key, &[], 1)?,
//             &[curr_associated_account_info.clone(), curr_table_mint_account_info.clone(), payer_account_info.clone()],
//         )?;
//     }
//     msg!("Hellow_Bn_2");
//     Ok(mint_table(program_id, accounts, 0 ,Some(rarity+1))?)
}

pub fn process_instructions(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
        let instruction = InstructionEnum::decode(instruction_data)?;

        // msg!("{:?}", instruction);

        match instruction {

            InstructionEnum::InitTable{governor_reward, payer_bump} =>{
                msg!("{:?}",(governor_reward, payer_bump));
                init_mint(program_id, accounts, governor_reward, payer_bump)
            }
            InstructionEnum::SignTableMint => {
                sign_table_mint(program_id, accounts)
            }   
            InstructionEnum::CreateTableSalesAccount =>{create_table_sales_account(program_id, accounts)}

            InstructionEnum::BurnNFTs{rarity} => {burn_nft(program_id, accounts, rarity)}

            InstructionEnum::MintTable{payer_bump} => {mint_table(program_id, accounts, payer_bump)}
        }
}

// #[cfg(test)]
// mod tests {
//     // use std::str::FromStr;

//     // use solana_program::pubkey::Pubkey;

//     use crate::{Sales, get_price, get_num_cnt, get_rand_num};
//     use solana_program::{pubkey::Pubkey, msg};
//     use std::str::FromStr;

//     #[test]
//     fn testing_get_price() {
//         // let mut x: Option<&Pubkey> = Some(&Pubkey::from_str("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").unwrap());

//         let sales_account_data = Sales{
//             vault_total :0.0,
//             counter :0,
//         };
//         assert_eq!(get_price(&sales_account_data), 90*10e8 as u64);
//     }

//     #[test]
//     fn testing_get_num_cnt(){
//         assert_eq!(get_num_cnt(&[255,255,255]), 255*255+255);
//     }

//     #[test]
//     fn testing_get_rand_num(){
//         let num = 100000 as f32;
//         let expected_vals = [(num*0.1/100.0) as u32, (num*1.0/100.0) as u32, (num*3.4/100.0) as u32, (num*5.5/100.0) as u32, (num*10.0/100.0) as u32, (num*20.0/100.0) as u32, (num*60.0/100.0) as u32];
//         let mut received_vals:[u32; 7] = [0,0,0,0,0,0,0];

//         for i in 0..num as usize{
//             let new_ind =  get_rand_num(i as f32, &Pubkey::from_str("FmyvDLhtWu1WMSUWnCpS1aTP3TvEJaCRJt1b8geD5B3J").unwrap(), &Pubkey::from_str("FmyvDLhtWu1WMSUWnCpS1aTP3TvEJaCRJt1b8geD5B3J").unwrap())%1000;

//             if new_ind == 689{received_vals[0] += 1;}
//             else if new_ind >= 432 && new_ind < 442{received_vals[1] += 1}
//             else if new_ind >= 600 && new_ind < 634{received_vals[2] += 1}
//             else if new_ind >= 545 && new_ind < 600{received_vals[3] += 1}
//             else if new_ind < 100{received_vals[4] += 1}
//             else if new_ind > 800{received_vals[5] += 1}
//             else{received_vals[6] += 1}
            
//         }

//         msg!("{:?} : {:?}", expected_vals, received_vals);
//         for i in 0..7{
//             assert!(expected_vals[i] as f32 + 0.05 * expected_vals[i] as f32 >received_vals[i] as f32 && (expected_vals[i] as f32 - 0.05 * expected_vals[i] as f32) < received_vals[i] as f32);
//         }
//     }
// }