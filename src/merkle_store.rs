use cosmwasm_std::{Storage, StdResult};
use cw_storage_plus::Map;
use crate::merkle::MerkleTree;
use crate::state::CONFIG;

pub struct MerkleStore<'a> {
    tree: MerkleTree,
    storage: Map<'a, &'a str, String>,
}

impl<'a> MerkleStore<'a> {
    pub fn new(levels: usize, storage: Map<'a, &'a str, String>) -> Self {
        Self {
            tree: MerkleTree::new(levels),
            storage,
        }
    }

    pub fn insert(&mut self, store: &mut dyn Storage, leaf: String) -> StdResult<(usize, Vec<String>)> {
        let (index, proof) = self.tree.insert(leaf.clone());
        
        // Store the leaf
        let key = format!("leaf_{}", index);
        self.storage.save(store, &key, &leaf)?;
        
        // Update the root
        let root = self.tree.get_root();
        CONFIG.update(store, |mut config| -> StdResult<_> {
            config.current_root = root;
            Ok(config)
        })?;
        
        Ok((index, proof))
    }

    pub fn get_root(&self, store: &dyn Storage) -> StdResult<String> {
        if self.tree.nodes.is_empty() {
            return Ok("0".repeat(64));
        }
        
        let last_level = self.tree.levels - 1;
        let key = format!("level_{}_node_0", last_level);
        self.storage.load(store, &key)
    }
} 