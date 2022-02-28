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


}

impl From<GlobalError> for ProgramError {
    fn from(e: GlobalError) -> Self {
        ProgramError::Custom(e as u32)
    }
}