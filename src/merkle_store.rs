use cosmwasm_std::{StdResult, Storage};
use cw_storage_plus::Map;
use crate::merkle::MerkleTree;
use crate::state::CONFIG;

pub struct MerkleStore<'a> {
    levels: usize,
    storage: Map<'a, String, String>,
}

impl<'a> MerkleStore<'a> {
    pub fn new(levels: usize) -> Self {
        Self {
            levels,
            storage: Map::new("merkle_tree"),
        }
    }

    pub fn get_levels(&self) -> usize {
        self.levels
    }

    pub fn update_root(&self, store: &mut dyn Storage, root: String) -> StdResult<()> {
        self.storage.save(store, "root".to_string(), &root)
    }

    pub fn get_root(&self, store: &dyn Storage) -> StdResult<Option<String>> {
        self.storage.may_load(store, "root".to_string())
    }

    pub fn insert(&self, store: &mut dyn Storage, index: usize, value: String) -> StdResult<()> {
        let key = format!("leaf_{}", index);
        self.storage.save(store, key, &value)
    }

    pub fn get(&self, store: &dyn Storage, index: usize) -> StdResult<Option<String>> {
        let key = format!("leaf_{}", index);
        self.storage.may_load(store, key)
    }
} 