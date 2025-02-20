use ark_bn254::Fr;
use std::str::FromStr;

// Generate a commitment from nullifier and secret
pub fn generate_commitment(nullifier: &str, secret: &str) -> String {
    let nullifier_fr = Fr::from_str(nullifier).expect("Invalid nullifier");
    let secret_fr = Fr::from_str(secret).expect("Invalid secret");
    
    hash_pair(&nullifier_fr.to_string(), &secret_fr.to_string())
}

// Generate nullifier hash from nullifier
pub fn generate_nullifier_hash(nullifier: &str) -> String {
    let nullifier_fr = Fr::from_str(nullifier).expect("Invalid nullifier");
    nullifier_fr.to_string()
}

// Verify a Merkle proof
pub fn verify_merkle_proof(
    proof: &[String],
    root: &str,
    leaf: &str,
    index: usize,
) -> bool {
    let mut current = Fr::from_str(leaf).expect("Invalid leaf");
    let mut current_index = index;

    for sibling in proof {
        let sibling_fr = Fr::from_str(sibling).expect("Invalid sibling");
        let (left, right) = if current_index % 2 == 0 {
            (current, sibling_fr)
        } else {
            (sibling_fr, current)
        };

        current = Fr::from_str(&hash_pair(&left.to_string(), &right.to_string())).expect("Invalid hash");
        current_index /= 2;
    }

    current.to_string() == root
}

// Hash a pair of nodes
pub fn hash_pair(left: &str, right: &str) -> String {
    let left_fr = Fr::from_str(left).expect("Invalid left node");
    let right_fr = Fr::from_str(right).expect("Invalid right node");
    
    (left_fr + right_fr).to_string()
} 