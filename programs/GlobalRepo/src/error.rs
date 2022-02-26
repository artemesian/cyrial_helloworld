use solana_program::{decode_error::DecodeError, program_error::ProgramError};
use thiserror::Error;
use num_derive::FromPrimitive;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum GlobalError {
    #[error("Struct Ids checked to not match")]
    InvalidStructId,


}

impl From<GlobalError> for ProgramError {
    fn from(e: GlobalError) -> Self {
        ProgramError::Custom(e as u32)
    }
}