use cosmwasm_std::{Coin, Uint128, StdResult, StdError};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;
use schemars::JsonSchema;
use base64;

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
pub struct Verifier {
    pub vk_json: String,  // Actually making it public now
}

impl Verifier {
    pub fn new() -> Self {
        // Load the binary verification key
        let vk_bytes = include_bytes!("verification_key/verification_key.bin");
        
        // Try to deserialize and validate the key
        match MixerVerifyingKey::new(vk_bytes) {
            Ok(vk) => {
                // Validate key format
                if let Err(e) = vk.validate() {
                    panic!(
                        "Invalid verification key format:\n\
                        Error: {:?}\n\
                        Key length: {} bytes\n\
                        First 32 bytes: {:02x?}",
                        e,
                        vk_bytes.len(),
                        &vk_bytes[..32.min(vk_bytes.len())]
                    );
                }
                
                let vk_base64 = base64::encode(vk_bytes);
                Self {
                    vk_json: vk_base64,
                }
            },
            Err(e) => {
                panic!(
                    "Failed to deserialize verification key:\n\
                    Length: {} bytes\n\
                    First 32 bytes: {:02x?}\n\
                    Error: {:?}\n\
                    Full key: {:02x?}",
                    vk_bytes.len(),
                    &vk_bytes[..32.min(vk_bytes.len())],
                    e,
                    vk_bytes
                );
            }
        }
    }

    pub fn to_verifying_key(&self) -> StdResult<MixerVerifyingKey> {
        // Decode base64 to bytes with detailed error
        let vk_bytes = base64::decode(&self.vk_json)
            .map_err(|e| StdError::generic_err(format!(
                "Failed to decode verification key from base64: {}. Base64 string length: {}", 
                e, 
                self.vk_json.len()
            )))?;
        
        // Log key details before attempting deserialization
        let debug_info = format!(
            "Verification key details:\n\
            Length: {} bytes\n\
            First 32 bytes: {:02x?}\n\
            Last 32 bytes: {:02x?}",
            vk_bytes.len(),
            &vk_bytes[..32.min(vk_bytes.len())],
            &vk_bytes[vk_bytes.len().saturating_sub(32)..]
        );
        
        // Create and validate MixerVerifyingKey
        let vk = MixerVerifyingKey::new(&vk_bytes)
            .map_err(|e| StdError::generic_err(format!(
                "Invalid verification key format: {}\n{}",
                e,
                debug_info
            )))?;
        
        // Additional validation
        vk.validate()
            .map_err(|e| StdError::generic_err(format!(
                "Verification key validation failed: {}\n{}",
                e,
                debug_info
            )))?;
            
        Ok(vk)
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