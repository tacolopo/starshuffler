use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, StdError,
    Uint128, ensure_eq, BankMsg,
};
use cw2::set_contract_version;
use hex;
use ark_groth16::Proof;
use ark_serialize::CanonicalDeserialize;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ConfigResponse};
use crate::state::{Config, CONFIG, NULLIFIERS, MERKLE_TREE, COMMITMENTS, VERIFYING_KEY_STORE};
use crate::zk_snark::{MixerVerifyingKey, MixerProof, verify_withdrawal};

const CONTRACT_NAME: &str = "crates.io:juno-privacy-mixer";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

// Verifying key for the zk-SNARK circuit
const VERIFYING_KEY: &[u8] = include_bytes!("../circuit/build/circuits/verification_key.json");

// Add a function to initialize the verifying key
fn init_verifying_key(deps: &mut DepsMut) -> StdResult<()> {
    let vk = MixerVerifyingKey::new(VERIFYING_KEY)
        .map_err(|e| StdError::generic_err(format!("Invalid verifying key: {}", e)))?;
    VERIFYING_KEY_STORE.save(deps.storage, &vk)?;
    Ok(())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    mut deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    init_verifying_key(&mut deps)?;

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
    let config = CONFIG.load(deps.storage)?;
    
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

    // Update config with new deposit count
    CONFIG.update(deps.storage, |mut config| -> StdResult<_> {
        config.num_deposits += Uint128::new(1);
        Ok(config)
    })?;

    Ok(Response::new()
        .add_attribute("method", "deposit")
        .add_attribute("commitment", commitment)
        .add_attribute("index", deposit_index.to_string()))
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

    // Load verifying key
    let vk = VERIFYING_KEY_STORE.load(deps.storage)?;

    // Convert proof from hex
    let proof_bytes = hex::decode(&proof[0])
        .map_err(|e| StdError::generic_err(format!("Invalid proof hex: {}", e)))?;
    
    let proof = Proof::deserialize_uncompressed(&proof_bytes[..])
        .map_err(|e| StdError::generic_err(format!("Invalid proof format: {}", e)))?;

    let mixer_proof = MixerProof {
        proof,
        public_inputs: vec![], // You'll need to implement conversion of root and nullifier_hash to Fr
    };

    // Verify the proof
    verify_withdrawal(&vk, &mixer_proof)?;
    
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