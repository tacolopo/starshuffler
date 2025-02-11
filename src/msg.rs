use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Coin, Uint128};

#[cw_serde]
pub struct InstantiateMsg {
    pub denomination: Coin,           // The token denomination for this mixer
    pub merkle_tree_levels: u32,     // Number of levels in the Merkle tree
}

#[cw_serde]
pub enum ExecuteMsg {
    // Deposit funds into the mixer
    Deposit {
        commitment: String,  // Hash of (nullifier + secret)
    },
    // Withdraw funds from the mixer
    Withdraw {
        nullifier_hash: String,     // Hash of the nullifier
        root: String,               // Merkle root
        proof: Vec<String>,         // Zero-knowledge proof
        recipient: String,          // Address to receive the funds
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    // Get the current state of the mixer
    #[returns(ConfigResponse)]
    GetConfig {},
    // Check if a nullifier has been used
    #[returns(bool)]
    IsNullifierUsed { nullifier_hash: String },
    // Get the current merkle root
    #[returns(String)]
    GetMerkleRoot {},
}

#[cw_serde]
pub struct ConfigResponse {
    pub denomination: Coin,
    pub merkle_tree_levels: u32,
    pub num_deposits: Uint128,
} 