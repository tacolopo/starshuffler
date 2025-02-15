use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Invalid funds")]
    InvalidFunds {},

    #[error("Invalid denomination")]
    InvalidDenomination {},

    #[error("Nullifier already used")]
    NullifierAlreadyUsed {},

    #[error("Invalid Merkle root")]
    InvalidMerkleRoot {},

    #[error("Invalid proof")]
    InvalidProof {},

    #[error("Invalid verifying key")]
    InvalidVerifyingKey {},

    #[error("Failed to generate proof")]
    ProofGenerationError {},

    #[error("Failed to verify proof: {msg}")]
    ProofVerificationError { msg: String },
} 