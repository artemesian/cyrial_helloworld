// use solana_program::{
//     declare_id,
// };

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
}



pub mod Governor{
    solana_program::declare_id!("DdyiDbh71JnpYbxdA9i4ECcd573sTm8Uur2GCgcB3P5k");
}

pub mod vault{
    solana_program::declare_id!("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z");
}


pub mod Dao{
    solana_program::declare_id!("DrSryh4M2nYyRSqgDNMiASK73LSoZrN56oHWXaAcnmCt");
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
