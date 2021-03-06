// use solana_program::{
//     pubkey::Pubkey,
// };
use borsh::{BorshDeserialize, BorshSerialize};
use error::GlobalError;
// use instruction_enums::TableInstructionEnum;
// use solana_program::program_error::ProgramError;

pub mod error;
pub mod instruction_enums;

#[derive(BorshSerialize, BorshDeserialize)]
pub enum StructId{
    AvatarSales0_0_1,
    AvatarData0_0_1,
    RentContainerData0_0_1,
    AccountRentSpace0_0_1,
    CollectionData0_0_1,
    ContainerData0_0_1,
    GovernorData0_0_1,
    GovernorSales0_0_1,
    Proposals0_0_1,
    GovernorVote0_0_1,
    GovernorsVote0_0_1,
    ProposalResult0_0_1,
    Proposal0_0_1,
    TableSales0_0_1,
    TableData0_0_1,
    ProposalNumGovernors0_0_1,
    ProposalLockGovernor0_0_1,
    DsolData0_0_1,

}

impl StructId{
    pub fn decode(struct_id: u32) -> Result<Self, GlobalError> {
        match struct_id {
            0 => {Ok(Self::AvatarSales0_0_1)}
            1 => {Ok(Self::AvatarData0_0_1)}
            2 => {Ok(Self::RentContainerData0_0_1)}
            3 => {Ok(Self::AccountRentSpace0_0_1)}
            4 => {Ok(Self::CollectionData0_0_1)}
            5 => {Ok(Self::ContainerData0_0_1)}
            6 => {Ok(Self::GovernorData0_0_1)}
            7 => {Ok(Self::GovernorSales0_0_1)}
            8 => {Ok(Self::Proposals0_0_1)}
            9 => {Ok(Self::GovernorVote0_0_1)}
            10 => {Ok(Self::GovernorsVote0_0_1)}
            11 => {Ok(Self::ProposalResult0_0_1)}
            12 => {Ok(Self::Proposal0_0_1)}
            13 => {Ok(Self::TableSales0_0_1)}
            14 => {Ok(Self::TableData0_0_1)}
            15 => {Ok(Self::ProposalNumGovernors0_0_1)}
            16 => {Ok(Self::ProposalLockGovernor0_0_1)}
            17 => {Ok(Self::DsolData0_0_1)}
            _ => {Err(GlobalError::InvalidStructId)}
        }
    }

    pub fn encode(enumval: Self) -> Result<u32, GlobalError> {
        match enumval {
            Self::AvatarSales0_0_1 => {Ok(0)}
            Self::AvatarData0_0_1 => {Ok(1)}
            Self::RentContainerData0_0_1 => {Ok(2)}
            Self::AccountRentSpace0_0_1 => {Ok(3)}
            Self::CollectionData0_0_1 => {Ok(4)}
            Self::ContainerData0_0_1 => {Ok(5)}
            Self::GovernorData0_0_1 => {Ok(6)}
            Self::GovernorSales0_0_1 => {Ok(7)}
            Self::Proposals0_0_1 => {Ok(8)}
            Self::GovernorVote0_0_1 => {Ok(9)}
            Self::GovernorsVote0_0_1 => {Ok(10)}
            Self::ProposalResult0_0_1 => {Ok(11)}
            Self::Proposal0_0_1 => {Ok(12)}
            Self::TableSales0_0_1 => {Ok(13)}
            Self::TableData0_0_1 => {Ok(14)}
            Self::ProposalNumGovernors0_0_1 => {Ok(15)}
            Self::ProposalLockGovernor0_0_1 => {Ok(16)}
            Self::DsolData0_0_1 => {Ok(17)}
            // _ => {Err(GlobalError::InvalidStructId)}
        }
    }
}



pub mod governor{
    use solana_program::pubkey::Pubkey;

    solana_program::declare_id!("8Ga7yNCYJiJ6HLTZMu14iNh6una9AGZvuM4n9napx1v3");

    pub mod vault{
       solana_program::declare_id!("25N4Q6k5PPFmeqAco84y7UuM1w9bNmyJdssoJLJ9GqXv");
    }

    pub fn creator() -> Pubkey {
        let (mint_authority_pda, _mint_authority_bump) = Pubkey::find_program_address(&[b"mint_authority"], &id());
        mint_authority_pda
    }
}

pub mod vault{
    solana_program::declare_id!("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z");
}

pub mod lounge{
    solana_program::declare_id!("53toELc2ZRKUQKcbCcpq3JfUxu6CamAfKWThxbHuiwCP");
}
pub mod avatar{
    solana_program::declare_id!("ASV3UahwSK3oRmNkkbyhFNSRSaccL2jJvAYCYQa8RSgG");
}
pub mod dao{
    solana_program::declare_id!("7y8RbM8qx3V4Hnwj8fmkd1H96e8xeVsAQQ9zc5WYRsCF");
}

pub mod dsol{
    solana_program::declare_id!("4zTDFeuFhdevrJ8rnoZum8m9dgoLqdMEFnPhgDhRCG16");
}

pub mod table{
    solana_program::declare_id!("7fmmvCJ1uH4sfLCdZrDAjJnfHejwtFbYL7aG8nnNR6Yz");
}

pub mod marketplace{
    solana_program::declare_id!("5hLihu5RjNSTPFFGP2nurV3xnJCeLj12WJXgphRDVMvE");
}

pub mod dsol_mint{
    use solana_program::pubkey::Pubkey;
    use spl_associated_token_account::{get_associated_token_address};

    use crate::vault;

    solana_program::declare_id!("HSYdApQF2FKVNnX6FQ1ySYstGLe5Gp8NseHVFavWye66");
    pub fn vault_associated_token_account() -> Pubkey {
        get_associated_token_address(&vault::id(), &id())
    }
}




#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
