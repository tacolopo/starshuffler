use cosmwasm_std::{Coin, Uint128};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;

#[derive(Serialize, Deserialize, Clone, Debug)]
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