use solana_program::{
    // decode_error::DecodeError,
     program_error::ProgramError};
use thiserror::Error;
use num_derive::FromPrimitive;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum GlobalError {
    #[error("Struct Ids checked do not match")]
    InvalidStructId,

    #[error("Signature will exceed maximum necessary if allowed, Hence I yelled")]
    TooManySigningGovernors,

    #[error("Keys comparison Doesn't match")]
    KeypairNotEqual,

    #[error("Unlockable date not yet reached")]
    NotUnlockableDate,

    #[error("Issue closing account")]
    CloseAccountError,

    #[error("Table has already been minted")]
    TableAlreadyMinted,

    #[error("Too much requested")]
    TooMuchRequestedAmount,

    #[error("Ammount too miniscule")]
    AmountTooSmall,

    #[error("Last previous pay date to distant from current date")]
    LoanPaymentError,

    #[error("Exhorbitant amount attempted to pay")]
    ExhorbitantAmount,

}

impl From<GlobalError> for ProgramError {
    fn from(e: GlobalError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
