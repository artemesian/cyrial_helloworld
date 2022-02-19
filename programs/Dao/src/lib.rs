use arrayref::array_ref;
use borsh::{BorshDeserialize, BorshSerialize};
use metaplex_token_metadata::{id, state::Metadata};
use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    // program_pack::Pack,
    msg,
    system_instruction, borsh::try_from_slice_unchecked, clock::Clock, sysvar::Sysvar, program::invoke_signed, rent::Rent, program_pack::Pack,
};

use spl_associated_token_account::{get_associated_token_address};
use spl_token::state::Account;
enum InstructionEnum{
    CreateProposal{
        proposal: String,
        choices: String,
        duration: u64
    },
    Vote{vote_enum:[u8;5], vote_bump: u32},
}

mod governor_creator{
    solana_program::declare_id!("FmyvDLhtWu1WMSUWnCpS1aTP3TvEJaCRJt1b8geD5B3J");
}
// #[derive(BorshSerialize, BorshDeserialize)]
// // struct Choice{
// //     proposal_pda: [u8;32],
// //     choice_bump: u8,
// //     text: String,
// // }

#[derive(BorshSerialize, BorshDeserialize)]
struct Proposals{
    proposal_id: u32,
    proposal_address: [u8;32]
}

#[derive(BorshSerialize, BorshDeserialize)]
struct GovernorVote{
    proposal_pda: [u8;32],
    mint_id: [u8;32],
    choice_bumps: [u8;5]
}

#[derive(BorshSerialize, BorshDeserialize)]
struct GovernorsVote{
    proposal_pda: [u8; 32],
    vote_bump: u32
}

#[derive(BorshSerialize, BorshDeserialize)]
struct ProposalResult{
    leading_choice_bump: u8,
    choice_1: [u8; 5],
    choice_2: [u8; 5],
    choice_3: [u8; 5],
    choice_4: [u8; 5],
    choice_5: [u8; 5],
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Proposal{
    proposal_pda: [u8;32],
    proposal: String,
    choices: String,
    max_vote_bump: u32,
    proposal_governor_id: [u8;32],
    duration: u64,
    ending_date: u64,
    result: ProposalResult,
}

fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}

impl InstructionEnum {
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        match data[0]{
            1 => {
                let proposal =  String::from(std::str::from_utf8(&data[1..1001]).expect("data conversion or proposal to str failed"));
                let choices = String::from(std::str::from_utf8(&data[1001 .. 1101]).expect("data conversion of choice {i} failed"));
                let duration = get_num_cnt(&data[1101..1104]) as u64 * 86400;
                Ok(Self::CreateProposal{proposal, choices, duration})}
            2 => {
                let vote_enum:[u8;5] = array_ref!(data[1..6], 0,5).clone();
                let vote_bump = get_num_cnt(&data[6..9]);

                Ok(Self::Vote{vote_enum, vote_bump})}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn create_proposal(program_id: &Pubkey, accounts: &[AccountInfo], proposal: String, choices: String, duration: u64) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    
    let payer_account_info = next_account_info(account_info_iter)?;
    let governor_account_info = next_account_info(account_info_iter)?;
    let proposals_info = next_account_info(account_info_iter)?;
    let proposal_pda_info = next_account_info(account_info_iter)?;
    let sysvar_clock_info = next_account_info(account_info_iter)?;
    let metadata_account_info = next_account_info(account_info_iter)?;
    let governor_associated_info = next_account_info(account_info_iter)?;
    
    let clock = Clock::from_account_info(&sysvar_clock_info)?;
    let current_timestamp = clock.unix_timestamp as u64;


    let proposals: Proposals = try_from_slice_unchecked(&proposals_info.data.borrow())?;
    let (proposal_pda, proposal_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposals.proposal_id.to_be_bytes(), ], program_id);
    if *proposal_pda_info.key != proposal_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &governor_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let metadata = Metadata::from_account_info(metadata_account_info)?;

    match metadata.data.creators{
        Some(creators) =>{
            for creator in creators.iter(){
                if creator.address == governor_creator::id(){
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

    let associated_token_address =  get_associated_token_address(payer_account_info.key, governor_account_info.key);

    if associated_token_address != *governor_associated_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    if Account::unpack(&governor_associated_info.data.borrow())?.amount != 1{
        Err(ProgramError::Custom(1))?
    }

    let proposal_struct = Proposal{
        proposal_pda: proposal_pda.to_bytes(),
        proposal: proposal,
        choices: choices,
        max_vote_bump: 0,
        proposal_governor_id: governor_account_info.key.to_bytes(),
        duration: duration,
        ending_date: current_timestamp + duration,
        result: ProposalResult{leading_choice_bump:0, choice_1: [0, 0, 0, 0, 0], choice_2: [0, 0, 0, 0, 0], choice_3: [0, 0, 0, 0, 0], choice_4: [0, 0, 0, 0, 0], choice_5: [0, 0, 0, 0, 0] }
    };

    let space = 2000;
    let lamports = Rent::get()?.minimum_balance(space as usize);

    invoke_signed(
        &system_instruction::create_account(
            payer_account_info.key,
            &proposal_pda,
            lamports,
            space,
            program_id
        ),
        &[payer_account_info.clone(), proposal_pda_info.clone()],
        &[ &[b"Dsol_Dao_Governance", &proposals.proposal_id.to_be_bytes(), &[proposal_pda_bump]] ]
    )?;

    proposal_struct.serialize(&mut &mut proposal_pda_info.data.borrow_mut()[..])?;


    
    Ok(())
}
fn vote(program_id: &Pubkey, accounts: &[AccountInfo], vote:[u8; 5], vote_bump: u32) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let governor_account_info = next_account_info(account_info_iter)?;
    let vote_pda_info = next_account_info(account_info_iter)?;
    let proposal_pda_info = next_account_info(account_info_iter)?;
    let governor_pda_info = next_account_info(account_info_iter)?;
    // let sysvar_clock_info = next_account_info(account_info_iter)?;
    let metadata_account_info = next_account_info(account_info_iter)?;
    let governor_associated_info = next_account_info(account_info_iter)?;

    let (vote_pda, vote_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &vote_bump.to_be_bytes()], program_id);

    if vote_pda != *vote_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    let space = 200;
    let lamports = Rent::get()?.minimum_balance(space as usize);
    
    invoke_signed(
        &system_instruction::create_account(payer_account_info.key, vote_pda_info.key, lamports, space, program_id),
        &[payer_account_info.clone(), vote_pda_info.clone()],
        &[&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &vote_bump.to_be_bytes(), &[vote_pda_bump]]]
    )?;

    
    let (governor_pda, governor_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &governor_account_info.key.to_bytes()], program_id);

    if governor_pda != *governor_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    invoke_signed(
        &system_instruction::create_account(payer_account_info.key, governor_pda_info.key, lamports, space, program_id),
        &[payer_account_info.clone(), governor_pda_info.clone()],
        &[&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &governor_pda_info.key.to_bytes(), &[governor_pda_bump]]]
    )?;

    let governor_vote= GovernorVote {
        proposal_pda: proposal_pda_info.key.to_bytes(),
        mint_id: governor_account_info.key.to_bytes(),
        choice_bumps: vote,
    };

    let governors_vote = GovernorsVote{
        proposal_pda: proposal_pda_info.key.to_bytes(),
        vote_bump: vote_bump,
    };


    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &governor_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }

    let metadata = Metadata::from_account_info(metadata_account_info)?;

    match metadata.data.creators{
        Some(creators) =>{
            for creator in creators.iter(){
                if creator.address == governor_creator::id(){
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

    let associated_token_address =  get_associated_token_address(payer_account_info.key, governor_account_info.key);

    if associated_token_address != *governor_associated_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    if Account::unpack(&governor_associated_info.data.borrow())?.amount != 1{
        Err(ProgramError::Custom(1))?
    }

    governor_vote.serialize(&mut &mut vote_pda_info.data.borrow_mut()[..])?;
    governors_vote.serialize(&mut &mut governor_pda_info.data.borrow_mut()[..])?;



    Ok(())
}

fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult{
    match InstructionEnum::decode(instruction_data)? {
        InstructionEnum::CreateProposal{proposal, choices, duration} => {create_proposal(program_id, accounts, proposal, choices, duration )}
        InstructionEnum::Vote{vote_enum, vote_bump} => {
            vote(program_id, accounts, vote_enum, vote_bump)
        }
    }
}



entrypoint!(process_instructions);
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
