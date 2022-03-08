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

extern crate global_repo;
// use global_repo::error::GlobalError;


use spl_associated_token_account::{get_associated_token_address};
use spl_token::state::Account;
enum InstructionEnum{
    CreateProposal{
        proposal: String,
        choices: String,
        duration: u64
    },
    Vote{vote_enum:[u8;5]},
    CreateProposalsAccount,
    ProcessResult
}

// #[derive(BorshSerialize, BorshDeserialize)]
// // struct Choice{
// //     proposal_pda: [u8;32],
// //     choice_bump: u8,
// //     text: String,
// // }

#[derive(BorshSerialize, BorshDeserialize, Clone)]
struct Proposals{
    proposal_id: u32,
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
struct GovernorVote{
    proposal_pda: [u8;32],
    mint_id: [u8;32],
    choice_bumps: [u8;5]
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
struct GovernorsVote{
    proposal_pda: [u8; 32],
    vote_bump: u32
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
struct ProposalResult{
    leading_choice_bump: u8,
    choices:[u32;5]
}

#[derive(BorshSerialize, BorshDeserialize, Clone)]
struct Proposal{
    proposal_pda: [u8;32],
    proposal: String,
    choices: String,
    max_vote_bump: u32,
    proposal_governor_id: [u8;32],
    duration: u64,
    ending_date: u64,
    votes: Vec<GovernorVote>,
    result: ProposalResult,
}

fn get_num_cnt(arr: &[u8]) -> u32 {
    arr[0] as u32 * arr[1] as u32 + arr[2] as u32
}


impl InstructionEnum {
    fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        // msg!("\nDATA_0: {:?}\n", data[0]);
        match data[0]{
            1 => {
                let proposal_len = 500;
                let choice_len = 30;
                let proposal =  String::from(std::str::from_utf8(&data[1..proposal_len+1]).expect("data conversion or proposal to str failed"));
                let choices = String::from(std::str::from_utf8(&data[proposal_len+ 1 .. proposal_len + 1 + 5*choice_len]).expect("data conversion of choice {i} failed"));
                let duration = get_num_cnt(&data[proposal_len + 1 + 5*choice_len .. proposal_len + 1 + 5*choice_len + 3]) as u64 * 86400;
                msg!("Logging right before return of enum decoding on instruction 1");
                Ok(Self::CreateProposal{proposal, choices, duration})}
            2 => {
                let vote_enum:[u8;5] = array_ref!(data[1..6], 0,5).clone();

                Ok(Self::Vote{vote_enum})}
            3 => {Ok(Self::CreateProposalsAccount)}
            4 =>{Ok(Self::ProcessResult)}
            _ => {Err(ProgramError::InvalidInstructionData)}
        }
    }
}

fn create_proposal(program_id: &Pubkey, accounts: &[AccountInfo], proposal: String, choices: String, duration: u64) -> ProgramResult{
    // msg!("logging beginning of create_proposal");
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
    
    // msg!("right before proposals deserialization");
    let mut proposals: Proposals = try_from_slice_unchecked(&proposals_info.data.borrow())?;
    let (proposal_pda, proposal_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposals.proposal_id.to_be_bytes(), ], program_id);
    // msg!("\nPROPOSAL_PDA: {:?}:             PROPOSAL_ID: {:?}\n", proposal_pda, proposals.proposal_id.to_be_bytes());
    if *proposal_pda_info.key != proposal_pda{
        msg!("proposal pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }

    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &governor_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        msg!("metadata pdas do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("right before metadata fetch");
    let metadata = Metadata::from_account_info(metadata_account_info)?;
    // msg!("right before metadata check");
    let mut found = false;
    match metadata.data.creators{
        Some(creators) =>{
            for creator in creators.iter(){
                if creator.address == global_repo::governor::creator(){
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
            if !found{
            msg!("NFT, Wrong Creator in Account Sent");
            Err(ProgramError::InvalidAccountData)?
            }
        }
        None => {msg!("Cannot Certify Authenticity of this NFT"); Err(ProgramError::InvalidAccountData)?}
    }
    // msg!("right after metadata check");
    let associated_token_address =  get_associated_token_address(payer_account_info.key, governor_account_info.key);

    if associated_token_address != *governor_associated_info.key{
        msg!("associated token address do not match");
        Err(ProgramError::InvalidAccountData)?
    }
    // msg!("right before fetching governor associated token account data balance");
    if Account::unpack(&governor_associated_info.data.borrow())?.amount != 1{
        msg!(" governor associated token account balance is not equal to: 1");
        Err(ProgramError::Custom(1))?
    }
    // msg!("log right after checking associated account data balance");
    let proposal_struct = Proposal{
        proposal_pda: proposal_pda.to_bytes(),
        proposal: proposal,
        choices: choices,
        max_vote_bump: 0,
        proposal_governor_id: governor_account_info.key.to_bytes(),
        duration: duration,
        votes: Vec::new(),
        ending_date: current_timestamp + duration,
        result: ProposalResult{leading_choice_bump:0, choices:[0,0,0,0,0]}
    };

    let space = 10000;
    let lamports = Rent::get()?.minimum_balance(space as usize);
    // msg!("Where are we");
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
    // msg!("Reached here too");
    proposal_struct.serialize(&mut &mut proposal_pda_info.data.borrow_mut()[..])?;

    proposals.proposal_id += 1;
    proposals.serialize(&mut &mut proposals_info.data.borrow_mut()[..])?;

    
    Ok(())
}


fn vote(program_id: &Pubkey, accounts: &[AccountInfo], vote:[u8; 5]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    msg!("D_SOL_DAO_LOF:   1");
    let payer_account_info = next_account_info(account_info_iter)?;
    let governor_account_info = next_account_info(account_info_iter)?;
    // let vote_pda_info = next_account_info(account_info_iter)?;
    let proposal_pda_info = next_account_info(account_info_iter)?;
    let governor_pda_info = next_account_info(account_info_iter)?;
    // let sysvar_clock_info = next_account_info(account_info_iter)?;
    let metadata_account_info = next_account_info(account_info_iter)?;
    let governor_associated_info = next_account_info(account_info_iter)?;

    // let (vote_pda, vote_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &vote_bump.to_be_bytes()], program_id);
    // msg!("D_SOL_DAO_LOF:   2");
    // if vote_pda != *vote_pda_info.key{
    //     Err(ProgramError::InvalidAccountData)?
    // }

    let space = 100;
    let lamports = Rent::get()?.minimum_balance(space as usize);
    // msg!("D_SOL_DAO_LOF:   3");
    // invoke_signed(
    //     &system_instruction::create_account(payer_account_info.key, vote_pda_info.key, lamports, space, program_id),
    //     &[payer_account_info.clone(), vote_pda_info.clone()],
    //     &[&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &vote_bump.to_be_bytes(), &[vote_pda_bump]]]
    // )?;

    let mut proposal: Proposal = try_from_slice_unchecked(&proposal_pda_info.data.borrow())?;
    msg!("D_SOL_DAO_LOF:   4");
    let (governor_pda, governor_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &governor_account_info.key.to_bytes()], program_id);

    if governor_pda != *governor_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("D_SOL_DAO_LOF:   5");
    invoke_signed(
        &system_instruction::create_account(payer_account_info.key, governor_pda_info.key, lamports, space, program_id),
        &[payer_account_info.clone(), governor_pda_info.clone()],
        &[&[b"Dsol_Dao_Governance", &proposal_pda_info.key.to_bytes(), &governor_account_info.key.to_bytes(), &[governor_pda_bump]]]
    )?;
    msg!("D_SOL_DAO_LOF:   6");
    let governor_vote= GovernorVote {
        proposal_pda: proposal_pda_info.key.to_bytes(),
        mint_id: governor_account_info.key.to_bytes(),
        choice_bumps: vote,
    };
    msg!("D_SOL_DAO_LOF:   7");
    let governors_vote = GovernorsVote{
        proposal_pda: proposal_pda_info.key.to_bytes(),
        vote_bump: proposal.max_vote_bump,
    };
    proposal.votes.push(governor_vote);

    msg!("D_SOL_DAO_LOF:   8");
    let (metadata_pda, _metadata_nonce) = Pubkey::find_program_address(&[b"metadata", &id().to_bytes(), &governor_account_info.key.to_bytes()], &id());

    if *metadata_account_info.key != metadata_pda{
        Err(ProgramError::InvalidAccountData)?
    }
    msg!("D_SOL_DAO_LOF:   9");
    let metadata = Metadata::from_account_info(metadata_account_info)?;
    let mut found = false;
    match metadata.data.creators{
        Some(creators) =>{
            for creator in creators.iter(){
                if creator.address == global_repo::governor::creator(){
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
            if !found{
                msg!("NFT, Wrong Creator in Account Sent");
                msg!("");
                Err(ProgramError::InvalidAccountData)?
                }
        }
        None => {msg!("Cannot Certify Authenticity of this NFT"); Err(ProgramError::InvalidAccountData)?}
    }
    msg!("D_SOL_DAO_LOF:   10");
    let associated_token_address =  get_associated_token_address(payer_account_info.key, governor_account_info.key);

    if associated_token_address != *governor_associated_info.key{
        Err(ProgramError::InvalidAccountData)?
    }

    if Account::unpack(&governor_associated_info.data.borrow())?.amount != 1{
        Err(ProgramError::Custom(1))?
    }
    proposal.max_vote_bump +=1;
    // governor_vote.serialize(&mut &mut vote_pda_info.data.borrow_mut()[..])?;
    proposal.serialize(&mut &mut proposal_pda_info.data.borrow_mut()[..])?;
    governors_vote.serialize(&mut &mut governor_pda_info.data.borrow_mut()[..])?;


    Ok(())
}

fn create_proposals_account(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let proposals_pda_info = next_account_info(account_info_iter)?;

    let space = 50;
    let lamports = Rent::get()?.minimum_balance(space as usize);

    let (proposals_pda, proposals_pda_bump) = Pubkey::find_program_address(&[b"Dsol_Dao_Governance"], program_id);

    if proposals_pda != *proposals_pda_info.key{
        Err(ProgramError::InvalidAccountData)?
    }
    invoke_signed(
        &system_instruction::create_account(payer_account_info.key, proposals_pda_info.key, lamports, space, program_id),
        &[payer_account_info.clone(), proposals_pda_info.clone()],
        &[&[b"Dsol_Dao_Governance", &[proposals_pda_bump]]]
    )?;

    let proposals = Proposals{
        proposal_id: 0
    };

    proposals.serialize(&mut &mut proposals_pda_info.data.borrow_mut()[..])?;

    Ok(())
}

fn proposal_result(votes: Vec<GovernorVote>) -> ProposalResult{
    let mut temp_result: [u32;5] = [0,0,0,0,0];

    for governor in votes{
        for i in 0..5{
            temp_result[i] += governor.choice_bumps[i] as u32;
        }
    }
    let mut leading_choice_bump = 0;

    for i in 0..5{
        if temp_result[i] > temp_result[leading_choice_bump]{
            leading_choice_bump = i;
        }
    }
    ProposalResult{leading_choice_bump: leading_choice_bump as u8, choices: temp_result}

}

fn process_result(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult{
    let account_info_iter = &mut accounts.iter();
    // let payer_account_info = next_account_info(account_info_iter)?;
    let proposal_pda_info = next_account_info(account_info_iter)?;
    if proposal_pda_info.owner != program_id{
        Err(ProgramError::InvalidAccountData)?
    }

    let mut proposal:Proposal = try_from_slice_unchecked(&proposal_pda_info.data.borrow())?;

    proposal.result = proposal_result(proposal.votes.clone());
    
    proposal.serialize(&mut &mut proposal_pda_info.data.borrow_mut()[..])?;


    Ok(())
}

fn process_instructions(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult{
    // if program_id != &program::id(){Err(ProgramError::IncorrectProgramId)?}
    match InstructionEnum::decode(instruction_data)? {
        InstructionEnum::CreateProposal{proposal, choices, duration} => {create_proposal(program_id, accounts, proposal, choices, duration )}
        InstructionEnum::Vote{vote_enum} => {
            vote(program_id, accounts, vote_enum)
        }
        InstructionEnum::CreateProposalsAccount =>{
            create_proposals_account(program_id, accounts)
        }
        InstructionEnum::ProcessResult => {
            process_result(program_id, accounts)
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
