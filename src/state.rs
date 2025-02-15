use cosmwasm_std::{Coin, Uint128, StdResult, StdError};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;
use schemars::JsonSchema;
use hex;

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
pub struct Verifier {
    vk_json: String,
}

impl Verifier {
    pub fn new() -> Self {
        let vk_json = include_str!("../circuit/build/circuits/verification_key.json");
        Self {
            vk_json: vk_json.to_string(),
        }
    }

    pub fn to_verifying_key(&self) -> StdResult<MixerVerifyingKey> {
        let vk_bytes = hex::decode(&self.vk_json)
            .map_err(|e| StdError::generic_err(format!("Invalid verification key hex: {}", e)))?;
        MixerVerifyingKey::new(&vk_bytes)
            .map_err(|e| StdError::generic_err(format!("Invalid verifying key: {}", e)))
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

// Store the verifying key
pub const VERIFYING_KEY_STORE: Item<MixerVerifyingKey> = Item::new("verifying_key"); 