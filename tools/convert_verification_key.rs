use std::fs::File;
use std::io::BufReader;
use std::io::Write;
use serde::Deserialize;
use ark_bn254::{Bn254, Fr, G1Affine, G2Affine};
use ark_ff::PrimeField;
use ark_groth16::VerifyingKey;
use ark_serialize::CanonicalSerialize;
use ark_ec::AffineRepr;

// Define a struct matching the JSON format from snarkjs
#[derive(Deserialize)]
struct SnarkjsVerificationKey {
    protocol: String,
    curve: String,
    #[serde(rename = "nPublic")]
    n_public: u32,
    vk_alpha_1: Vec<String>,
    vk_beta_2: Vec<Vec<String>>,
    vk_gamma_2: Vec<Vec<String>>,
    vk_delta_2: Vec<Vec<String>>,
    #[serde(rename = "IC")]
    ic: Vec<Vec<String>>,
}

fn parse_g1(coords: &[String]) -> Result<G1Affine, Box<dyn std::error::Error>> {
    assert_eq!(coords.len(), 3); // Should have x, y, and z coordinates
    let x = Fr::from_str(&coords[0])?;
    let y = Fr::from_str(&coords[1])?;
    // z coordinate should be 1 for affine form
    assert_eq!(coords[2], "1", "G1 point must be in affine form");
    Ok(G1Affine::new(x, y))
}

fn parse_g2(coords: &[Vec<String>]) -> Result<G2Affine, Box<dyn std::error::Error>> {
    assert_eq!(coords.len(), 3); // Should have x, y, and z coordinates
    let x = vec![
        Fr::from_str(&coords[0][0])?,
        Fr::from_str(&coords[0][1])?
    ];
    let y = vec![
        Fr::from_str(&coords[1][0])?,
        Fr::from_str(&coords[1][1])?
    ];
    // z coordinate should be [1,0] for affine form
    assert_eq!(coords[2][0], "1", "G2 point must be in affine form");
    assert_eq!(coords[2][1], "0", "G2 point must be in affine form");
    Ok(G2Affine::new(x, y))
}

fn convert_vk() -> Result<(), Box<dyn std::error::Error>> {
    // Read the JSON verification key
    let file = File::open("src/verification_key/verification_key.json")?;
    let reader = BufReader::new(file);
    let snarkvk: SnarkjsVerificationKey = serde_json::from_reader(reader)?;

    // Convert the components to Arkworks format
    let alpha_g1 = parse_g1(&snarkvk.vk_alpha_1)?;
    let beta_g2 = parse_g2(&snarkvk.vk_beta_2)?;
    let gamma_g2 = parse_g2(&snarkvk.vk_gamma_2)?;
    let delta_g2 = parse_g2(&snarkvk.vk_delta_2)?;

    // Convert IC array
    let mut ic = Vec::new();
    for coords in snarkvk.ic.iter() {
        ic.push(parse_g1(coords)?);
    }

    // Create Arkworks VerifyingKey
    let vk = VerifyingKey::<Bn254> {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2,
        gamma_abc_g1: ic,
    };

    // Serialize to binary
    let mut buffer = Vec::new();
    // Write a version byte (1) and padding to align
    buffer.extend_from_slice(&[1, 0, 0, 0]);
    // Then write the verification key
    vk.serialize_uncompressed(&mut buffer)?;

    // Write binary file
    let mut out_file = File::create("src/verification_key/verification_key.bin")?;
    out_file.write_all(&buffer)?;

    println!("Successfully converted verification key to Arkworks binary format");
    Ok(())
}

fn main() {
    if let Err(e) = convert_vk() {
        eprintln!("Conversion failed: {}", e);
        std::process::exit(1);
    }
} 