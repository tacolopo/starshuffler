use cosmwasm_schema::cw_serde;
use cosmwasm_std::{StdError, StdResult};
use ark_bn254::{Bn254, Fr};
use ark_groth16::{
    Proof, VerifyingKey,
    prepare_verifying_key,
    verify_proof,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
pub struct MixerVerifyingKey(#[serde(skip)] VerifyingKey<Bn254>);

impl MixerVerifyingKey {
    pub fn new(bytes: &[u8]) -> Result<Self, ark_serialize::SerializationError> {
        let vk = VerifyingKey::deserialize_uncompressed(bytes)?;
        Ok(MixerVerifyingKey(vk))
    }
}

#[derive(Clone)]
pub struct MixerProof {
    pub proof: Proof<Bn254>,
    pub public_inputs: Vec<Fr>,
}

pub fn verify_withdrawal(
    vk: &MixerVerifyingKey,
    proof: &MixerProof,
) -> StdResult<bool> {
    let pvk = prepare_verifying_key(&vk.0);
    
    verify_proof(&pvk, &proof.proof, &proof.public_inputs)
        .map_err(|e| StdError::generic_err(format!("Proof verification failed: {}", e)))
}

// Helper function to serialize proof for storage
pub fn serialize_proof(proof: &MixerProof) -> StdResult<Vec<u8>> {
    let mut bytes = Vec::new();
    proof
        .proof
        .serialize_uncompressed(&mut bytes)
        .map_err(|e| StdError::generic_err(format!("Failed to serialize proof: {}", e)))?;
    Ok(bytes)
}

// Helper function to serialize verifying key for storage
pub fn serialize_vk(vk: &MixerVerifyingKey) -> StdResult<Vec<u8>> {
    let mut bytes = Vec::new();
    vk.0.serialize_uncompressed(&mut bytes)
        .map_err(|e| StdError::generic_err(format!("Failed to serialize verifying key: {}", e)))?;
    Ok(bytes)
} 