use std::fs::File;
use std::io::{BufReader, Write};
use std::str::FromStr;
use serde::Deserialize;
use ark_bn254::{Bn254, Fq, G1Affine, G2Affine, Fq2};
use ark_groth16::VerifyingKey;
use ark_serialize::{CanonicalSerialize, CanonicalDeserialize};

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
    assert_eq!(coords.len(), 3, "G1 point must have 3 coordinates");
    let x = Fq::from_str(&coords[0])
        .map_err(|_| "Failed to parse x coordinate")?;
    let y = Fq::from_str(&coords[1])
        .map_err(|_| "Failed to parse y coordinate")?;
    
    // Verify z coordinate is 1 (affine form)
    assert_eq!(coords[2], "1", "G1 point must be in affine form");
    
    let point = G1Affine::new(x, y);
    assert!(point.is_on_curve(), "G1 point not on curve");
    Ok(point)
}

fn parse_g2(coords: &[Vec<String>]) -> Result<G2Affine, Box<dyn std::error::Error>> {
    assert_eq!(coords.len(), 3, "G2 point must have 3 coordinates");
    
    // Create Fq2 elements for x and y coordinates
    let x = Fq2::new(
        Fq::from_str(&coords[0][0]).map_err(|_| "Failed to parse x0")?,
        Fq::from_str(&coords[0][1]).map_err(|_| "Failed to parse x1")?
    );
    
    let y = Fq2::new(
        Fq::from_str(&coords[1][0]).map_err(|_| "Failed to parse y0")?,
        Fq::from_str(&coords[1][1]).map_err(|_| "Failed to parse y1")?
    );
    
    // Verify z coordinate is [1,0] (affine form)
    assert_eq!(coords[2][0], "1", "G2 point must be in affine form");
    assert_eq!(coords[2][1], "0", "G2 point must be in affine form");
    
    let point = G2Affine::new(x, y);
    assert!(point.is_on_curve(), "G2 point not on curve");
    Ok(point)
}

fn convert_vk() -> Result<(), Box<dyn std::error::Error>> {
    println!("Reading verification key from JSON...");
    let file = File::open("src/verification_key/verification_key.json")?;
    let reader = BufReader::new(file);
    let snarkvk: SnarkjsVerificationKey = serde_json::from_reader(reader)?;

    // Print full verification key structure
    println!("Verification Key Structure:");
    println!("  Protocol: {}", snarkvk.protocol);
    println!("  Curve: {}", snarkvk.curve);
    println!("  nPublic: {}", snarkvk.n_public);
    println!("  IC length: {}", snarkvk.ic.len());
    println!("  vk_alpha_1 length: {}", snarkvk.vk_alpha_1.len());
    println!("  vk_beta_2 length: {}", snarkvk.vk_beta_2.len());
    
    // Validate protocol and curve
    assert_eq!(snarkvk.protocol, "groth16", "Only Groth16 protocol is supported");
    assert_eq!(snarkvk.curve, "bn128", "Only BN128 curve is supported");
    
    // Check if IC length matches n_public
    if snarkvk.ic.len() != (snarkvk.n_public + 1) as usize {
        return Err(format!(
            "Mismatch between nPublic ({}) and IC length ({}). Note: IC length should be nPublic + 1", 
            snarkvk.n_public, snarkvk.ic.len()
        ).into());
    }
    
    println!("Converting points to Arkworks format...");
    
    let alpha_g1 = parse_g1(&snarkvk.vk_alpha_1)?;
    let beta_g2 = parse_g2(&snarkvk.vk_beta_2)?;
    let gamma_g2 = parse_g2(&snarkvk.vk_gamma_2)?;
    let delta_g2 = parse_g2(&snarkvk.vk_delta_2)?;

    println!("Converting IC points...");
    
    let mut ic = Vec::new();
    for coords in snarkvk.ic.iter() {
        ic.push(parse_g1(coords)?);
    }

    let vk = VerifyingKey::<Bn254> {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2,
        gamma_abc_g1: ic,
    };

    println!("Serializing to binary format...");
    
    let mut buffer = Vec::new();
    vk.serialize_uncompressed(&mut buffer)?;

    // Calculate expected sizes
    let g1_size = 2 * 32;  // x,y coordinates
    let g2_size = 4 * 32;  // x_c1,x_c0,y_c1,y_c0 coordinates
    let ic_size = snarkvk.ic.len() * g1_size;  // Each IC point is a G1 point
    let ic_length_size = 4;  // uint32 for number of IC points
    let vec_length_header = 4;  // uint32 header for vector length

    let expected_length = 
        g1_size +     // alpha_g1
        g2_size +     // beta_g2
        g2_size +     // gamma_g2
        g2_size +     // delta_g2
        vec_length_header + // Vector length header
        ic_length_size + // IC length
        ic_size;     // IC points

    println!("Size breakdown:");
    println!("  alpha_g1: {} bytes", g1_size);
    println!("  beta_g2: {} bytes", g2_size);
    println!("  gamma_g2: {} bytes", g2_size);
    println!("  delta_g2: {} bytes", g2_size);
    println!("  Vector length header: {} bytes", vec_length_header);
    println!("  IC length field: {} bytes", ic_length_size);
    println!("  IC points ({}): {} bytes", snarkvk.ic.len(), ic_size);
    println!("  Total expected: {} bytes", expected_length);
    println!("  Actual buffer: {} bytes", buffer.len());
    
    assert_eq!(buffer.len(), expected_length, 
        "Invalid serialized length. Expected {}, got {}", 
        expected_length, buffer.len());

    let mut out_file = File::create("src/verification_key/verification_key.bin")?;
    out_file.write_all(&buffer)?;

    // Test deserialization of the binary key
    println!("\nTesting deserialization of binary key...");
    let test_buffer = std::fs::read("src/verification_key/verification_key.bin")?;
    let _test_vk = VerifyingKey::<Bn254>::deserialize_uncompressed(&test_buffer[..])
        .map_err(|e| format!("Failed to deserialize verification key: {}", e))?;
    println!("✓ Successfully deserialized verification key");

    println!("\nSuccessfully converted verification key to Arkworks binary format");
    println!("Output size: {} bytes", buffer.len());
    println!("Number of IC points: {}", snarkvk.ic.len());
    Ok(())
}

fn main() {
    if let Err(e) = convert_vk() {
        eprintln!("Conversion failed: {}", e);
        std::process::exit(1);
    }
} 