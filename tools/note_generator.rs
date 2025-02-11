use rand::Rng;
use sha2::{Sha256, Digest};
use ark_bn254::Fr;
use ark_ff::PrimeField;

#[derive(Debug, Clone)]
pub struct Note {
    pub nullifier: String,
    pub secret: String,
    pub commitment: String,
    pub recipient: String,
}

impl Note {
    pub fn new(recipient: String) -> Self {
        let mut rng = rand::thread_rng();
        
        // Generate random nullifier and secret
        let nullifier: [u8; 32] = rng.gen();
        let secret: [u8; 32] = rng.gen();
        
        // Generate commitment
        let mut hasher = Sha256::new();
        hasher.update(&nullifier);
        hasher.update(&secret);
        let commitment = hex::encode(hasher.finalize());
        
        Self {
            nullifier: hex::encode(nullifier),
            secret: hex::encode(secret),
            commitment,
            recipient,
        }
    }

    pub fn to_field_elements(&self) -> Result<(Fr, Fr), Box<dyn std::error::Error>> {
        // Convert hex strings to field elements
        let nullifier_bytes = hex::decode(&self.nullifier)?;
        let secret_bytes = hex::decode(&self.secret)?;
        
        let nullifier = Fr::from_be_bytes_mod_order(&nullifier_bytes);
        let secret = Fr::from_be_bytes_mod_order(&secret_bytes);
        
        Ok((nullifier, secret))
    }

    pub fn generate_nullifier_hash(&self) -> String {
        let mut hasher = Sha256::new();
        hasher.update(hex::decode(&self.nullifier).unwrap());
        hex::encode(hasher.finalize())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_note_generation() {
        let recipient = "juno1...".to_string();
        let note = Note::new(recipient.clone());
        
        assert_eq!(note.recipient, recipient);
        assert_eq!(note.nullifier.len(), 64); // 32 bytes in hex
        assert_eq!(note.secret.len(), 64);
        assert_eq!(note.commitment.len(), 64);
        
        // Test field element conversion
        let (nullifier, secret) = note.to_field_elements().unwrap();
        assert!(nullifier != Fr::zero());
        assert!(secret != Fr::zero());
    }
} 