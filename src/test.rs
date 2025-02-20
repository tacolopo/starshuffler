#[cfg(test)]
mod tests {
    use ark_groth16::VerifyingKey;
    use ark_bn254::Bn254;
    use ark_serialize::CanonicalDeserialize;

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
} 