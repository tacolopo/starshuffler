use cosmwasm_schema::cw_serde;
use cosmwasm_std::{StdError, StdResult};
use ark_bn254::{Bn254, Fr};
use ark_groth16::{
    Proof, VerifyingKey, prepare_verifying_key,
    verify_proof as ark_verify_proof,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use std::str::FromStr;
use std::io::Cursor;

#[cw_serde]
pub struct MixerVerifyingKey {
    vk_bytes: Vec<u8>,
}

#[cw_serde]
pub struct MixerProof {
    proof_bytes: Vec<u8>,
    public_inputs: Vec<String>,
}

impl MixerVerifyingKey {
    pub fn new(vk_bytes: &[u8]) -> StdResult<Self> {
        // Verify that the bytes can be deserialized
        let mut cursor = Cursor::new(vk_bytes);
        VerifyingKey::<Bn254>::deserialize_with_mode(&mut cursor, ark_serialize::Compress::No, ark_serialize::Validate::No)
            .map_err(|e| StdError::generic_err(format!("Invalid verifying key: {}", e)))?;
        
        Ok(Self {
            vk_bytes: vk_bytes.to_vec(),
        })
    }

    pub fn verify_proof(&self, proof: &MixerProof) -> StdResult<bool> {
        let mut cursor = Cursor::new(&self.vk_bytes);
        let vk = VerifyingKey::<Bn254>::deserialize_with_mode(&mut cursor, ark_serialize::Compress::No, ark_serialize::Validate::No)
            .map_err(|e| StdError::generic_err(format!("Failed to deserialize verifying key: {}", e)))?;
        
        let pvk = prepare_verifying_key(&vk);
        
        let mut cursor = Cursor::new(&proof.proof_bytes);
        let proof = Proof::deserialize_with_mode(&mut cursor, ark_serialize::Compress::No, ark_serialize::Validate::No)
            .map_err(|e| StdError::generic_err(format!("Failed to deserialize proof: {}", e)))?;
        
        let public_inputs: Vec<Fr> = proof.public_inputs
            .iter()
            .map(|s| Fr::from_str(s).map_err(|e| StdError::generic_err(format!("Invalid public input: {}", e))))
            .collect::<Result<Vec<_>, _>>()?;
        
        ark_verify_proof(&pvk, &proof, &public_inputs)
            .map_err(|e| StdError::generic_err(format!("Proof verification failed: {}", e)))
    }
}

pub fn verify_withdrawal(
    vk: &MixerVerifyingKey,
    proof: &MixerProof,
    root: &str,
    nullifier_hash: &str,
) -> StdResult<bool> {
    // Verify that the public inputs match the expected values
    if proof.public_inputs.len() != 2 {
        return Err(StdError::generic_err("Invalid number of public inputs"));
    }
    
    if proof.public_inputs[0] != root {
        return Err(StdError::generic_err("Root mismatch"));
    }
    
    if proof.public_inputs[1] != nullifier_hash {
        return Err(StdError::generic_err("Nullifier hash mismatch"));
    }
    
    // Verify the proof
    vk.verify_proof(proof)
}

// Helper function to serialize proof for storage
pub fn serialize_proof(proof: &MixerProof) -> StdResult<Vec<u8>> {
    let mut bytes = Vec::new();
    proof
        .proof_bytes
        .serialize_uncompressed(&mut bytes)
        .map_err(|e| StdError::generic_err(format!("Failed to serialize proof: {}", e)))?;
    Ok(bytes)
}

// Helper function to serialize verifying key for storage
pub fn serialize_vk(vk: &MixerVerifyingKey) -> StdResult<Vec<u8>> {
    let mut bytes = Vec::new();
    vk.vk_bytes.serialize_uncompressed(&mut bytes)
        .map_err(|e| StdError::generic_err(format!("Failed to serialize verifying key: {}", e)))?;
    Ok(bytes)
} 