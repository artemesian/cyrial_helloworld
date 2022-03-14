use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{program_error::ProgramError, borsh::try_from_slice_unchecked};
use serde::{Serialize};

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize)]
pub enum TableInstructionEnum{
    InitTable{governor_reward: u32, payer_bump: u32},
    SignTableMint,
    CreateTableSalesAccount,
    BurnNFTs{rarity: u8},
    MintTable{payer_bump: u32},
    LockTable,
    UnlockTable,
}

impl TableInstructionEnum{
    pub fn decode(data: &[u8]) -> Result<Self, ProgramError>{
        let instruction_des:TableInstructionEnum = try_from_slice_unchecked(data)?;
        Ok(match instruction_des{
            TableInstructionEnum::InitTable{governor_reward, payer_bump} => {Self::InitTable{governor_reward:governor_reward, payer_bump:payer_bump}}
            TableInstructionEnum::SignTableMint => {Self::SignTableMint}
            TableInstructionEnum::CreateTableSalesAccount => {Self::CreateTableSalesAccount}
            TableInstructionEnum::BurnNFTs{rarity} => {Self::BurnNFTs{rarity:rarity}}
            TableInstructionEnum::MintTable{payer_bump} => {Self::MintTable{payer_bump:payer_bump}}
            TableInstructionEnum::LockTable => {Self::LockTable}
            TableInstructionEnum::UnlockTable => {Self::UnlockTable}
            // _ => {Err(ProgramError::InvalidInstructionData)}
        })
    }
}