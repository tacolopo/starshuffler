use sha2::{Sha256, Digest};
use crate::crypto::hash_pair;

pub struct MerkleTree {
    pub nodes: Vec<Vec<String>>,
    pub levels: usize,
}

impl MerkleTree {
    pub fn new(levels: usize) -> Self {
        let mut nodes = Vec::with_capacity(levels);
        for _ in 0..levels {
            nodes.push(Vec::new());
        }
        Self { nodes, levels }
    }

    pub fn insert(&mut self, leaf: String) -> (usize, Vec<String>) {
        let mut current_hash = leaf.clone();
        let mut proof = Vec::new();
        let index = self.nodes[0].len();

        // Insert leaf at level 0
        self.nodes[0].push(leaf);

        // Update higher levels
        for level in 0..(self.levels - 1) {
            let level_size = self.nodes[level].len();
            if level_size % 2 == 1 {
                // Odd number of nodes, hash with itself
                proof.push(current_hash.clone());
                current_hash = hash_pair(&current_hash, &current_hash);
            } else {
                // Even number of nodes, hash with previous node
                let sibling = &self.nodes[level][level_size - 2];
                proof.push(sibling.clone());
                current_hash = hash_pair(sibling, &current_hash);
            }
            self.nodes[level + 1].push(current_hash.clone());
        }

        (index, proof)
    }

    pub fn get_root(&self) -> String {
        if self.nodes[self.levels - 1].is_empty() {
            "0".repeat(64)
        } else {
            self.nodes[self.levels - 1][0].clone()
        }
    }

    pub fn verify_proof(&self, leaf: &str, proof: &[String], index: usize) -> bool {
        let mut current_hash = leaf.to_string();
        let mut current_index = index;

        for sibling in proof {
            current_hash = if current_index % 2 == 0 {
                hash_pair(&current_hash, sibling)
            } else {
                hash_pair(sibling, &current_hash)
            };
            current_index /= 2;
        }

        current_hash == self.get_root()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_merkle_tree() {
        let mut tree = MerkleTree::new(4);
        
        // Insert some leaves
        let leaf1 = "leaf1".to_string();
        let (index1, proof1) = tree.insert(leaf1.clone());
        
        let leaf2 = "leaf2".to_string();
        let (_index2, _proof2) = tree.insert(leaf2);
        
        // Verify proof
        assert!(tree.verify_proof(&leaf1, &proof1, index1));
    }
} 