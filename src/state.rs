use cosmwasm_std::{Coin, Uint128, StdResult, StdError};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;
use schemars::JsonSchema;
use base64::{engine::general_purpose::STANDARD, Engine};

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
pub struct Verifier {
    pub vk_json: String,  // base64 encoded verification key
}

impl Verifier {
    pub fn new() -> Self {
        let vk_bytes = include_bytes!(concat!(env!("OUT_DIR"), "/verification_key.bin"));
        
        println!("Loading verification key:");
        println!("- File size: {} bytes", vk_bytes.len());
        println!("- First 32 bytes (hex): {:02x?}", &vk_bytes[..32.min(vk_bytes.len())]);
        println!("- File format marker (if exists): {:?}", 
            String::from_utf8_lossy(&vk_bytes[..4.min(vk_bytes.len())]));

        // Try to detect if it's JSON
        if let Ok(json_str) = String::from_utf8(vk_bytes.to_vec()) {
            if json_str.trim_start().starts_with('{') {
                println!("WARNING: Verification key appears to be JSON format, expected binary");
            }
        }

        // Try to deserialize and validate the key
        match MixerVerifyingKey::new(vk_bytes) {
            Ok(vk) => {
                println!("Successfully parsed verification key structure");
                if let Err(e) = vk.validate() {
                    panic!("Validation failed: {:?}", e);
                }
                println!("Verification key validated successfully");
                Self {
                    vk_json: STANDARD.encode(vk_bytes),
                }
            },
            Err(e) => {
                panic!("Failed to parse verification key: {:?}", e);
            }
        }
    }

    pub fn to_verifying_key(&self) -> StdResult<MixerVerifyingKey> {
        // Create MixerVerifyingKey from base64 string
        let vk_bytes = STANDARD.decode(&self.vk_json)
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