#[cfg(test)]
mod tests {
    use ark_groth16::VerifyingKey;
    use ark_bn254::Bn254;
    use ark_serialize::CanonicalDeserialize;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, Coin, from_json};
    use crate::contract::{instantiate, execute, query};
    use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
    use crate::merkle::MerkleTree;

    #[test]
    fn test_direct_verification_key_deserialization() {
        // Load the raw verification key bytes
        let vk_bytes = include_bytes!("verification_key/verification_key.bin");
        println!("\nAnalyzing verification key binary:");
        println!("Total length: {} bytes", vk_bytes.len());
        
        // Print the first few sections
        println!("\nFirst 32 bytes (alpha_g1):");
        println!("{:02x?}", &vk_bytes[0..32]);
        
        println!("\nNext 64 bytes (beta_g2):");
        println!("{:02x?}", &vk_bytes[32..96]);
        
        // Deserialize the verification key
        match VerifyingKey::<Bn254>::deserialize_compressed(&vk_bytes[..]) {
            Ok(vk) => {
                println!("\nSuccessfully deserialized verification key");
                println!("Number of IC points: {}", vk.gamma_abc_g1.len());
                assert!(vk.alpha_g1.is_on_curve(), "alpha_g1 not on curve");
                assert!(vk.beta_g2.is_on_curve(), "beta_g2 not on curve");
                assert!(vk.gamma_g2.is_on_curve(), "gamma_g2 not on curve");
                assert!(vk.delta_g2.is_on_curve(), "delta_g2 not on curve");
                for (i, point) in vk.gamma_abc_g1.iter().enumerate() {
                    assert!(point.is_on_curve(), "IC point {} not on curve", i);
                }
            },
            Err(e) => {
                panic!("Failed to deserialize verification key: {:?}", e);
            }
        }
    }

    #[test]
    fn test_merkle_root_storage() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("creator", &[]);

        // Instantiate contract
        let msg = InstantiateMsg {
            denomination: Coin::new(1000000, "ujuno"),
            merkle_tree_levels: 20,
        };
        let _res = instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();

        // Check initial root (should be empty/zero)
        let root_query = QueryMsg::GetMerkleRoot {};
        let initial_root: String = from_json(&query(deps.as_ref(), env.clone(), root_query).unwrap()).unwrap();
        let expected_initial_root = "0".repeat(64);
        assert_eq!(initial_root, expected_initial_root, "Initial root should be 64 zeros");

        // Create a test commitment
        let commitment = "123456789".to_string(); // Simple test commitment
        let deposit_info = mock_info("depositor", &[Coin::new(1000000, "ujuno")]);

        // Make a deposit
        let deposit_msg = ExecuteMsg::Deposit {
            commitment: commitment.clone(),
        };
        let res = execute(deps.as_mut(), env.clone(), deposit_info, deposit_msg).unwrap();
        assert!(res.attributes.iter().any(|attr| attr.key == "commitment" && attr.value == commitment));

        // Query the merkle root after deposit
        let root_query = QueryMsg::GetMerkleRoot {};
        let root_response: String = from_json(&query(deps.as_ref(), env.clone(), root_query).unwrap()).unwrap();
        
        // Verify root is not empty after deposit
        assert_ne!(root_response, "", "Root should not be empty after deposit");
        assert_ne!(root_response, initial_root, "Root should change after deposit");
        
        // Calculate expected root
        let mut tree = MerkleTree::new(20);
        let (_, _) = tree.insert(commitment);
        let expected_root = tree.get_root();

        // Verify root matches expected value
        assert_eq!(root_response, expected_root, "Stored root does not match expected value");

        // Print roots for visibility
        println!("Initial root: {}", initial_root);
        println!("Root after deposit: {}", root_response);
        println!("Expected root: {}", expected_root);
    }
} 