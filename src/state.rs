use cosmwasm_std::{Coin, Uint128, StdResult, StdError};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;
use schemars::JsonSchema;
use base64;

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
pub struct Verifier {
    vk_json: String,
}

impl Verifier {
    pub fn new() -> Self {
        // Load the binary verification key
        let vk_bytes = include_bytes!("verification_key/verification_key.bin");
        
        // Convert to base64 for storage
        let vk_base64 = base64::encode(vk_bytes);
        
        Self {
            vk_json: vk_base64,  // Reusing vk_json field to store base64 binary
        }
    }

    pub fn to_verifying_key(&self) -> StdResult<MixerVerifyingKey> {
        // Decode base64 to bytes
        let vk_bytes = base64::decode(&self.vk_json)
            .map_err(|e| StdError::generic_err(format!("Failed to decode verification key: {}", e)))?;
        
        // Create MixerVerifyingKey from binary
        MixerVerifyingKey::new(&vk_bytes)
            .map_err(|e| StdError::generic_err(format!("Invalid verifying key format: {}", e)))
    }
}

pub const VERIFIER: Item<Verifier> = Item::new("verifier");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub denomination: Coin,
    pub merkle_tree_levels: u32,
    pub num_deposits: Uint128,
    pub current_root: String,
}

// Store contract config
pub const CONFIG: Item<Config> = Item::new("config");

// Store used nullifiers
pub const NULLIFIERS: Map<String, bool> = Map::new("nullifiers");

// Store the Merkle tree nodes
pub const MERKLE_TREE: Map<String, String> = Map::new("merkle_tree");

// Store the commitments for the Merkle tree
pub const COMMITMENTS: Map<String, bool> = Map::new("commitments"); 