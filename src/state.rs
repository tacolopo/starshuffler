use cosmwasm_std::{Coin, Uint128, StdResult, StdError};
use cw_storage_plus::{Item, Map};
use serde::{Serialize, Deserialize};
use crate::zk_snark::MixerVerifyingKey;
use schemars::JsonSchema;
use serde_json;
use hex;

#[derive(Serialize, Deserialize, Clone, Debug, JsonSchema)]
pub struct Verifier {
    vk_json: String,
}

impl Verifier {
    pub fn new() -> Self {
        // Load the verification key from the embedded file
        let vk_json = include_str!("../circuit/build/circuits/verification_key.json");
        
        // Validate the JSON format before storing
        let vk: serde_json::Value = serde_json::from_str(vk_json)
            .expect("Invalid verification key JSON format");
            
        // Ensure required fields are present
        assert!(vk.get("protocol").is_some(), "Missing protocol field");
        assert!(vk.get("curve").is_some(), "Missing curve field");
        
        Self {
            vk_json: vk_json.to_string(),
        }
    }

    pub fn to_verifying_key(&self) -> StdResult<MixerVerifyingKey> {
        // Parse the stored JSON
        let vk: serde_json::Value = serde_json::from_str(&self.vk_json)
            .map_err(|e| StdError::generic_err(format!("Failed to parse verifying key JSON: {}", e)))?;
            
        // Convert JSON fields to binary format
        let alpha_1 = vk["vk_alpha_1"].as_array().ok_or_else(|| StdError::generic_err("Invalid alpha_1"))?;
        let beta_2 = vk["vk_beta_2"].as_array().ok_or_else(|| StdError::generic_err("Invalid beta_2"))?;
        let gamma_2 = vk["vk_gamma_2"].as_array().ok_or_else(|| StdError::generic_err("Invalid gamma_2"))?;
        let delta_2 = vk["vk_delta_2"].as_array().ok_or_else(|| StdError::generic_err("Invalid delta_2"))?;
        
        // Serialize the key components into a binary format
        let mut binary_key = Vec::new();
        
        // Add protocol and curve identifiers
        binary_key.extend_from_slice(&[1u8]); // Version
        binary_key.extend_from_slice(&[1u8]); // Groth16 protocol
        binary_key.extend_from_slice(&[1u8]); // BN128 curve
        
        // Add key components
        for component in alpha_1 {
            binary_key.extend_from_slice(
                &hex::decode(component.as_str().unwrap_or("0").trim_start_matches("0x"))
                    .map_err(|e| StdError::generic_err(format!("Invalid hex: {}", e)))?
            );
        }
        
        for group in [beta_2, gamma_2, delta_2] {
            for point in group {
                if let Some(coords) = point.as_array() {
                    for coord in coords {
                        binary_key.extend_from_slice(
                            &hex::decode(coord.as_str().unwrap_or("0").trim_start_matches("0x"))
                                .map_err(|e| StdError::generic_err(format!("Invalid hex: {}", e)))?
                        );
                    }
                }
            }
        }
        
        // Create MixerVerifyingKey from binary
        MixerVerifyingKey::new(&binary_key)
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