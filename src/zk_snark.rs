use cosmwasm_std::{StdError, StdResult};
use ark_ff::Fp256;
use ark_ff::MontBackend;
use ark_ec::models::bn::Bn;
use ark_groth16::{
    Proof, VerifyingKey,
    prepare_verifying_key,
    Groth16,
};
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use serde::{Deserialize, Serialize};

// Define the types explicitly using the full paths
type Bn254 = Bn<ark_bn254::Config>;
type Fr = Fp256<MontBackend<ark_bn254::FrConfig, 4>>;

#[derive(Clone)]
pub struct MixerVerifyingKey(pub(crate) VerifyingKey<Bn254>);

impl MixerVerifyingKey {
    pub fn new(bytes: &[u8]) -> Result<Self, ark_serialize::SerializationError> {
        let vk = VerifyingKey::deserialize_uncompressed(bytes)?;
        Ok(MixerVerifyingKey(vk))
    }
}

impl<'a> Serialize for MixerVerifyingKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Storing the verifying key as none to avoid large JSON expansions
        serializer.serialize_none()
    }
}

impl<'de> Deserialize<'de> for MixerVerifyingKey {
    fn deserialize<D>(_deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        // We don't expect to read the VerifyingKey from JSON
        Ok(MixerVerifyingKey(VerifyingKey::default()))
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
    Groth16::<Bn254>::verify_proof(&pvk, &proof.proof, &proof.public_inputs)
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