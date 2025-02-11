use sha2::{Sha256, Digest};
use hex;

// Generate a commitment from nullifier and secret
pub fn generate_commitment(nullifier: &str, secret: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(nullifier.as_bytes());
    hasher.update(secret.as_bytes());
    hex::encode(hasher.finalize())
}

// Generate nullifier hash from nullifier
pub fn generate_nullifier_hash(nullifier: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(nullifier.as_bytes());
    hex::encode(hasher.finalize())
}

// Verify a Merkle proof
pub fn verify_merkle_proof(
    proof: &[String],
    root: &str,
    leaf: &str,
    index: usize,
) -> bool {
    let mut current = leaf.to_string();
    let mut current_index = index;

    for sibling in proof {
        let (left, right) = if current_index % 2 == 0 {
            (&current, sibling)
        } else {
            (sibling, &current)
        };

        current = hash_pair(left, right);
        current_index /= 2;
    }

    current == root
}

// Hash a pair of nodes
pub fn hash_pair(left: &str, right: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(left.as_bytes());
    hasher.update(right.as_bytes());
    hex::encode(hasher.finalize())
} 