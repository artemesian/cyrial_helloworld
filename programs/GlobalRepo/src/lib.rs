// use solana_program::{
//     declare_id,
// };
use borsh::{BorshDeserialize, BorshSerialize};

pub mod error;

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
    // RequestUnits0_0_1,
    TableSales0_0_1,
    TableData0_0_1,
    ProposalNumGovernors0_0_1,
    ProposalLockGovernor0_0_1,
    DsolData0_0_1,

}



pub mod governor{
    solana_program::declare_id!("GWJQHiudaVnhBmvCkRmMPeWs2rffhG2fmkXVRJHM9t5s");
}

pub mod vault{
    solana_program::declare_id!("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z");
}

pub mod avatar{
    solana_program::declare_id!("DvTvXKZR9wveQzL3pBM7QJ9YZpConSXBXRTyDsEADNqX");
}
pub mod dao{
    solana_program::declare_id!("DrSryh4M2nYyRSqgDNMiASK73LSoZrN56oHWXaAcnmCt");
}

pub mod dsol{
    solana_program::declare_id!("4zTDFeuFhdevrJ8rnoZum8m9dgoLqdMEFnPhgDhRCG16");
}

pub mod table{
    solana_program::declare_id!("7ZAXECRFXUJHU2L5G5imivRL3A7svS3LP9bEA3pRR6tG");
}

pub mod marketplace{
    solana_program::declare_id!("5hLihu5RjNSTPFFGP2nurV3xnJCeLj12WJXgphRDVMvE");
}

pub mod dsol_mint{
    use solana_program::pubkey::Pubkey;
    use spl_associated_token_account::{get_associated_token_address};

    use crate::vault;

    solana_program::declare_id!("4hnebtBZBkWF8NvPr4XUdKQFNj2tHim8nqephcMCsBos");
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
