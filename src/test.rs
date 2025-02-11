#[cfg(test)]
mod tests {
    use super::*;
    use crate::contract::{execute, instantiate, query};
    use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
    use crate::state::Config;
    use crate::circuit::MixerCircuit;
    use crate::note_generator::Note;
    use crate::zk_snark::{MixerProof, MixerVerifyingKey};
    use cosmwasm_std::testing::{
        mock_dependencies, mock_env, mock_info, MockApi, MockQuerier, MockStorage,
    };
    use cosmwasm_std::{OwnedDeps, coins, Addr, Coin, Uint128, from_binary};
    use merkle_tree::MerkleTree;
    use hex;

    const DENOM: &str = "ujuno";
    const AMOUNT: u128 = 1_000_000;

    fn setup_contract() -> (
        OwnedDeps<MockStorage, MockApi, MockQuerier>,
        MessageInfo,
        Env,
    ) {
        let mut deps = mock_dependencies();
        let info = mock_info("creator", &[]);
        let env = mock_env();

        // Instantiate contract
        let msg = InstantiateMsg {
            denomination: Coin {
                denom: DENOM.to_string(),
                amount: Uint128::from(AMOUNT),
            },
            merkle_tree_levels: 20,
        };

        let res = instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        assert_eq!(0, res.messages.len());

        (deps, info, env)
    }

    fn setup_test_proof() -> (MixerProof, String, String) {
        // This is a mock proof - in production, generate real proofs
        let proof_bytes = hex::decode("0123456789abcdef").unwrap();
        let root = "mock_root".to_string();
        let nullifier_hash = "mock_nullifier_hash".to_string();

        let proof = MixerProof {
            proof_bytes,
            public_inputs: vec![root.clone(), nullifier_hash.clone()],
        };

        (proof, root, nullifier_hash)
    }

    #[test]
    fn proper_initialization() {
        let (deps, _info, _env) = setup_contract();

        // Query the config
        let res = query(deps.as_ref(), mock_env(), QueryMsg::GetConfig {}).unwrap();
        let config: Config = from_binary(&res).unwrap();

        assert_eq!(config.denomination.denom, DENOM);
        assert_eq!(config.denomination.amount, Uint128::from(AMOUNT));
        assert_eq!(config.merkle_tree_levels, 20);
        assert_eq!(config.num_deposits, Uint128::zero());
    }

    #[test]
    fn test_deposit() {
        let (mut deps, info, env) = setup_contract();
        
        // Generate a note for deposit
        let recipient = "recipient".to_string();
        let note = Note::new(recipient);
        
        // Execute deposit
        let msg = ExecuteMsg::Deposit {
            commitment: note.commitment.clone(),
        };
        
        let deposit_info = mock_info(
            "depositor",
            &coins(AMOUNT, DENOM),
        );

        let res = execute(
            deps.as_mut(),
            env.clone(),
            deposit_info,
            msg,
        ).unwrap();

        // Verify deposit response
        assert_eq!(res.attributes.len(), 3);
        assert_eq!(
            res.attributes.iter().find(|attr| attr.key == "method").unwrap().value,
            "deposit"
        );
        assert_eq!(
            res.attributes.iter().find(|attr| attr.key == "commitment").unwrap().value,
            note.commitment
        );

        // Verify merkle tree update
        let root = query(deps.as_ref(), env.clone(), QueryMsg::GetMerkleRoot {}).unwrap();
        let root: String = from_binary(&root).unwrap();
        assert_ne!(root, "");
    }

    #[test]
    fn test_withdrawal() {
        let (mut deps, info, env) = setup_contract();
        
        // First make a deposit
        let recipient = "recipient".to_string();
        let note = Note::new(recipient.clone());
        
        let deposit_msg = ExecuteMsg::Deposit {
            commitment: note.commitment.clone(),
        };
        
        let deposit_info = mock_info(
            "depositor",
            &coins(AMOUNT, DENOM),
        );

        execute(
            deps.as_mut(),
            env.clone(),
            deposit_info,
            deposit_msg,
        ).unwrap();

        // Generate proof (simplified for test)
        let (nullifier, secret) = note.to_field_elements().unwrap();
        let root = query(deps.as_ref(), env.clone(), QueryMsg::GetMerkleRoot {}).unwrap();
        let root: String = from_binary(&root).unwrap();

        // Create withdrawal message
        let withdraw_msg = ExecuteMsg::Withdraw {
            nullifier_hash: note.generate_nullifier_hash(),
            root,
            proof: vec!["dummy_proof".to_string()], // In real implementation, this would be a real proof
            recipient: recipient.clone(),
        };

        let withdraw_info = mock_info("withdrawer", &[]);

        let res = execute(
            deps.as_mut(),
            env.clone(),
            withdraw_info,
            withdraw_msg.clone(),
        ).unwrap();

        // Verify withdrawal response
        assert_eq!(res.messages.len(), 1); // Should have one bank send message
        assert_eq!(res.attributes.len(), 3);
        
        // Verify nullifier is now used
        let nullifier_used = query(
            deps.as_ref(),
            env.clone(),
            QueryMsg::IsNullifierUsed {
                nullifier_hash: note.generate_nullifier_hash(),
            },
        ).unwrap();
        let is_used: bool = from_binary(&nullifier_used).unwrap();
        assert!(is_used);

        // Try to withdraw again with same nullifier (should fail)
        let err = execute(
            deps.as_mut(),
            env.clone(),
            withdraw_info,
            withdraw_msg,
        ).unwrap_err();
        assert_eq!(err, ContractError::NullifierAlreadyUsed {});
    }

    #[test]
    fn test_invalid_deposit_amount() {
        let (mut deps, info, env) = setup_contract();
        
        let note = Note::new("recipient".to_string());
        
        // Try to deposit with wrong amount
        let msg = ExecuteMsg::Deposit {
            commitment: note.commitment,
        };
        
        let invalid_info = mock_info(
            "depositor",
            &coins(AMOUNT + 1, DENOM), // Wrong amount
        );

        let err = execute(
            deps.as_mut(),
            env,
            invalid_info,
            msg,
        ).unwrap_err();
        
        assert_eq!(err, ContractError::InvalidDenomination {});
    }

    fn setup_complete_test() -> (Note, String, Vec<String>) {
        // Generate a new note
        let note = Note::new("recipient".to_string());
        
        // Create a merkle tree and insert the commitment
        let mut tree = MerkleTree::new(20);
        let (index, proof) = tree.insert(note.commitment.clone());
        
        // Get the current root
        let root = tree.get_root();
        
        (note, root, proof)
    }

    #[test]
    fn test_complete_flow() {
        let (mut deps, _info, env) = setup_contract();
        
        // Make a deposit
        let commitment = "test_commitment".to_string();
        let deposit_msg = ExecuteMsg::Deposit {
            commitment: commitment.clone(),
        };
        
        let deposit_info = mock_info(
            "depositor",
            &coins(AMOUNT, DENOM),
        );
        
        let res = execute(
            deps.as_mut(),
            env.clone(),
            deposit_info,
            deposit_msg,
        ).unwrap();
        
        assert_eq!(res.attributes.len(), 3);
        
        // Setup withdrawal
        let (proof, root, nullifier_hash) = setup_test_proof();
        let recipient = "recipient".to_string();
        
        // Try withdrawal
        let withdraw_msg = ExecuteMsg::Withdraw {
            nullifier_hash: nullifier_hash.clone(),
            root,
            proof: vec![hex::encode(proof.proof_bytes)],
            recipient: recipient.clone(),
        };
        
        let withdraw_info = mock_info("withdrawer", &[]);
        
        let res = execute(
            deps.as_mut(),
            env.clone(),
            withdraw_info.clone(),
            withdraw_msg.clone(),
        ).unwrap();
        
        // Verify withdrawal response
        assert_eq!(res.messages.len(), 1);
        
        // Try double-spend
        let err = execute(
            deps.as_mut(),
            env.clone(),
            withdraw_info,
            withdraw_msg,
        ).unwrap_err();
        
        assert_eq!(err, ContractError::NullifierAlreadyUsed {});
    }

    #[test]
    fn test_proof_verification() {
        let (mut deps, _info, env) = setup_contract();
        
        // Setup test data
        let (proof, root, nullifier_hash) = setup_test_proof();
        
        // Load verifying key
        let vk = VERIFYING_KEY_STORE.load(deps.storage).unwrap();
        
        // Test proof verification
        let result = verify_withdrawal(
            &vk,
            &proof,
            &root,
            &nullifier_hash,
        );
        
        // In this test environment, we expect verification to fail
        // because we're using mock data
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_proof() {
        let (mut deps, _info, env) = setup_contract();
        
        // Try withdrawal with invalid proof
        let withdraw_msg = ExecuteMsg::Withdraw {
            nullifier_hash: "invalid_nullifier".to_string(),
            root: "invalid_root".to_string(),
            proof: vec!["invalid_proof".to_string()],
            recipient: "recipient".to_string(),
        };
        
        let info = mock_info("anyone", &[]);
        
        let err = execute(
            deps.as_mut(),
            env,
            info,
            withdraw_msg,
        ).unwrap_err();
        
        // Should fail with proof verification error
        assert!(matches!(err, ContractError::ProofVerificationError {}));
    }

    #[test]
    fn test_query_nullifier() {
        let (mut deps, _info, _env) = setup_contract();
        
        let nullifier = "test_nullifier".to_string();
        
        // Check unused nullifier
        let res = query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::IsNullifierUsed {
                nullifier_hash: nullifier.clone(),
            },
        ).unwrap();
        
        let is_used: bool = from_binary(&res).unwrap();
        assert!(!is_used);
        
        // Mark nullifier as used
        NULLIFIERS.save(deps.as_mut().storage, &nullifier, &true).unwrap();
        
        // Check used nullifier
        let res = query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::IsNullifierUsed {
                nullifier_hash: nullifier,
            },
        ).unwrap();
        
        let is_used: bool = from_binary(&res).unwrap();
        assert!(is_used);
    }
} 