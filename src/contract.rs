use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
    Uint128, ensure_eq, BankMsg,
};
use cw2::set_contract_version;
use hex;
use ark_groth16::Proof;
use ark_serialize::CanonicalDeserialize;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ConfigResponse};
use crate::state::{Config, CONFIG, NULLIFIERS, MERKLE_TREE, COMMITMENTS, Verifier, VERIFIER};
use crate::zk_snark::{MixerProof, verify_withdrawal};
use crate::merkle::MerkleTree;

const CONTRACT_NAME: &str = "crates.io:juno-privacy-mixer";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    
    // Initialize verifier with compile-time verification key
    let verifier = Verifier::new();
    VERIFIER.save(deps.storage, &verifier)?;

    let config = Config {
        denomination: msg.denomination,
        merkle_tree_levels: msg.merkle_tree_levels,
        num_deposits: Uint128::zero(),
        current_root: "".to_string(),
    };
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Deposit { commitment } => execute_deposit(deps, env, info, commitment),
        ExecuteMsg::Withdraw {
            nullifier_hash,
            root,
            proof,
            recipient,
        } => execute_withdraw(deps, env, info, proof, root, nullifier_hash, recipient),
    }
}

pub fn execute_deposit(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    commitment: String,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;
    
    // Verify the sent amount matches the denomination
    ensure_eq!(
        info.funds.len(),
        1,
        ContractError::InvalidFunds {}
    );
    ensure_eq!(
        info.funds[0],
        config.denomination,
        ContractError::InvalidDenomination {}
    );

    // Store the commitment
    let deposit_index = config.num_deposits;
    COMMITMENTS.save(deps.storage, commitment.clone(), &true)?;

    // Update the Merkle tree
    let tree_key = format!("leaf_{}", deposit_index);
    MERKLE_TREE.save(deps.storage, tree_key, &commitment)?;

    // Calculate new root
    let mut tree = MerkleTree::new(config.merkle_tree_levels as usize);
    for i in 0..deposit_index.u128() + 1 {
        let key = format!("leaf_{}", i);
        if let Some(leaf) = MERKLE_TREE.may_load(deps.storage, key)? {
            tree.insert(leaf);
        }
    }
    
    // Update root in config
    config.current_root = tree.get_root();
    CONFIG.save(deps.storage, &config)?;

    // Update config with new deposit count
    config.num_deposits += Uint128::new(1);
    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "deposit")
        .add_attribute("commitment", commitment)
        .add_attribute("index", deposit_index.to_string())
        .add_attribute("root", config.current_root))
}

pub fn execute_withdraw(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    proof: Vec<String>,
    root: String,
    nullifier_hash: String,
    recipient: String,
) -> Result<Response, ContractError> {
    // Check if nullifier has been used
    if NULLIFIERS.may_load(deps.storage, nullifier_hash.clone())?.unwrap_or(false) {
        return Err(ContractError::NullifierAlreadyUsed {});
    }

    // Load and validate verifier
    let verifier = VERIFIER.load(deps.storage)?;
    let vk = verifier.to_verifying_key()
        .map_err(|e| ContractError::ProofVerificationError { 
            msg: format!("Failed to load verifying key: {}", e) 
        })?;

    // Convert proof from hex with better error handling
    let proof_bytes = hex::decode(&proof[0])
        .map_err(|e| ContractError::ProofVerificationError { 
            msg: format!("Invalid proof hex: {}", e) 
        })?;
    
    let proof = Proof::deserialize_uncompressed(&proof_bytes[..])
        .map_err(|e| ContractError::ProofVerificationError { 
            msg: format!("Invalid proof format: {}", e) 
        })?;

    // Convert root and nullifier_hash to field elements
    use ark_std::str::FromStr;
    use ark_bn254::Fr;

    let root_fr = Fr::from_str(&root)
        .map_err(|e| ContractError::ProofVerificationError {
            msg: format!("Invalid root format: {:?}", e)
        })?;

    let nullifier_fr = Fr::from_str(&nullifier_hash)
        .map_err(|e| ContractError::ProofVerificationError {
            msg: format!("Invalid nullifier hash format: {:?}", e)
        })?;

    let mixer_proof = MixerProof {
        proof,
        public_inputs: vec![root_fr, nullifier_fr],
    };

    // Verify the proof with detailed error
    verify_withdrawal(&vk, &mixer_proof)
        .map_err(|e| ContractError::ProofVerificationError { 
            msg: format!("Proof verification failed: {}", e) 
        })?;
    
    // Mark nullifier as used
    NULLIFIERS.save(deps.storage, nullifier_hash.clone(), &true)?;

    // Load config to get denomination
    let config = CONFIG.load(deps.storage)?;

    // Send funds to recipient
    let msg = BankMsg::Send {
        to_address: recipient,
        amount: vec![config.denomination],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("method", "withdraw")
        .add_attribute("nullifier_hash", nullifier_hash)
        .add_attribute("root", root))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => to_json_binary(&query_config(deps)?),
        QueryMsg::IsNullifierUsed { nullifier_hash } => {
            to_json_binary(&query_nullifier(deps, nullifier_hash)?)
        }
        QueryMsg::GetMerkleRoot {} => to_json_binary(&query_merkle_root(deps)?),
        QueryMsg::GetVerifier {} => to_json_binary(&query_verifier(deps)?),
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        denomination: config.denomination,
        merkle_tree_levels: config.merkle_tree_levels,
        num_deposits: config.num_deposits,
    })
}

fn query_nullifier(deps: Deps, nullifier_hash: String) -> StdResult<bool> {
    Ok(NULLIFIERS.may_load(deps.storage, nullifier_hash)?.unwrap_or(false))
}

fn query_merkle_root(deps: Deps) -> StdResult<String> {
    let config = CONFIG.load(deps.storage)?;
    Ok(config.current_root)
}

fn query_verifier(deps: Deps) -> StdResult<String> {
    let verifier = VERIFIER.load(deps.storage)?;
    Ok(verifier.vk_json.clone())
} 