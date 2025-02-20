use std::fs::File;
use std::io::{BufReader, Write};
use std::str::FromStr;
use serde::Deserialize;
use ark_bn254::{Bn254, Fq, G1Affine, G2Affine, Fq2};
use ark_groth16::VerifyingKey;
use ark_serialize::CanonicalSerialize;

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
    // z coordinate should be 1 for affine form
    assert_eq!(coords[2], "1", "G1 point must be in affine form");
    
    let point = G1Affine::new(x, y);
    assert!(point.is_on_curve(), "G1 point not on curve");
    Ok(point)
}

fn parse_g2(coords: &[Vec<String>]) -> Result<G2Affine, Box<dyn std::error::Error>> {
    assert_eq!(coords.len(), 3, "G2 point must have 3 coordinates");
    
    println!("\n=== Validating G2 point ===");
    println!("Raw point data: {}", serde_json::to_string_pretty(coords)?);
    
    println!("Point coordinates:");
    println!("x: {}", serde_json::to_string_pretty(&coords[0])?);
    println!("y: {}", serde_json::to_string_pretty(&coords[1])?);
    println!("z: {}", serde_json::to_string_pretty(&coords[2])?);
    
    println!("Converting coordinates to BigInt...");
    
    // Check z coordinate is [1,0] for affine form
    println!("z0: {}", coords[2][0]);
    println!("z1: {}", coords[2][1]);
    assert_eq!(coords[2][0], "1", "G2 point must be in affine form");
    assert_eq!(coords[2][1], "0", "G2 point must be in affine form");
    
    // Create Fq2 elements for x and y coordinates
    let x = Fq2::new(
        Fq::from_str(&coords[0][0]).map_err(|_| "Failed to parse x0")?,
        Fq::from_str(&coords[0][1]).map_err(|_| "Failed to parse x1")?
    );
    
    let y = Fq2::new(
        Fq::from_str(&coords[1][0]).map_err(|_| "Failed to parse y0")?,
        Fq::from_str(&coords[1][1]).map_err(|_| "Failed to parse y1")?
    );
    
    println!("Point already in standard form, no conversion needed");
    
    let point = G2Affine::new(x, y);
    assert!(point.is_on_curve(), "G2 point not on curve");
    
    println!("Final coordinates:");
    println!("affineX: {}", serde_json::to_string_pretty(&[x.c0.to_string(), x.c1.to_string()])?);
    println!("affineY: {}", serde_json::to_string_pretty(&[y.c0.to_string(), y.c1.to_string()])?);
    println!("=== G2 point validation complete ===\n");
    
    Ok(point)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Reading verification key from JSON...");
    let file = File::open("circuit/build/circuits/verification_key.json")?;
    let reader = BufReader::new(file);
    let snarkvk: SnarkjsVerificationKey = serde_json::from_reader(reader)?;

    // Validate protocol and curve
    assert_eq!(snarkvk.protocol, "groth16", "Only Groth16 protocol is supported");
    assert_eq!(snarkvk.curve, "bn128", "Only BN128 curve is supported");
    
    println!("\nRaw verification key points:");
    println!("alpha1: {}", serde_json::to_string_pretty(&snarkvk.vk_alpha_1)?);
    println!("beta2: {}", serde_json::to_string_pretty(&snarkvk.vk_beta_2)?);
    println!("gamma2: {}", serde_json::to_string_pretty(&snarkvk.vk_gamma_2)?);
    println!("delta2: {}", serde_json::to_string_pretty(&snarkvk.vk_delta_2)?);
    
    println!("\nConverting points to affine coordinates...");
    
    println!("Converting alpha_g1...");
    println!("Converting G1 point: {}", serde_json::to_string_pretty(&snarkvk.vk_alpha_1)?);
    let alpha_g1 = parse_g1(&snarkvk.vk_alpha_1)?;
    println!("Affine alpha1: [{}, {}]\n", alpha_g1.x, alpha_g1.y);
    
    println!("Converting beta_g2...");
    let beta_g2 = parse_g2(&snarkvk.vk_beta_2)?;
    println!("Affine beta2: [[{}, {}], [{}, {}]]\n", 
        beta_g2.x.c0, beta_g2.x.c1, beta_g2.y.c0, beta_g2.y.c1);
    
    println!("Converting gamma_2...");
    let gamma_g2 = parse_g2(&snarkvk.vk_gamma_2)?;
    println!("Affine gamma2: [[{}, {}], [{}, {}]]\n",
        gamma_g2.x.c0, gamma_g2.x.c1, gamma_g2.y.c0, gamma_g2.y.c1);
    
    println!("Converting delta_2...");
    let delta_g2 = parse_g2(&snarkvk.vk_delta_2)?;
    println!("Affine delta2: [[{}, {}], [{}, {}]]\n",
        delta_g2.x.c0, delta_g2.x.c1, delta_g2.y.c0, delta_g2.y.c1);

    println!("Converting IC points...");
    let mut ic = Vec::new();
    for (i, coords) in snarkvk.ic.iter().enumerate() {
        println!("Converting IC point {}...", i);
        println!("Converting G1 point: {}", serde_json::to_string_pretty(coords)?);
        ic.push(parse_g1(coords)?);
    }

    let vk = VerifyingKey::<Bn254> {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2,
        gamma_abc_g1: ic,
    };

    println!("Serializing to binary format (compressed)...");
    let mut buffer = Vec::new();
    vk.serialize_compressed(&mut buffer)?;

    // Print debug info
    println!("\nVerification key structure:");
    println!("alpha_g1: {}, {}", vk.alpha_g1.x, vk.alpha_g1.y);
    println!("beta_g2: {}, {} | {}, {}", 
        vk.beta_g2.x.c0, vk.beta_g2.x.c1, vk.beta_g2.y.c0, vk.beta_g2.y.c1);
    println!("gamma_g2: {}, {} | {}, {}", 
        vk.gamma_g2.x.c0, vk.gamma_g2.x.c1, vk.gamma_g2.y.c0, vk.gamma_g2.y.c1);
    println!("delta_g2: {}, {} | {}, {}", 
        vk.delta_g2.x.c0, vk.delta_g2.x.c1, vk.delta_g2.y.c0, vk.delta_g2.y.c1);
    println!("IC length: {}", vk.gamma_abc_g1.len());
    println!("First IC point: {}, {}", vk.gamma_abc_g1[0].x, vk.gamma_abc_g1[0].y);

    // Write the verification key
    std::fs::create_dir_all("src/verification_key")?;
    let mut out_file = File::create("src/verification_key/verification_key.bin")?;
    out_file.write_all(&buffer)?;

    println!("✓ Verification key files generated in src/verification_key/");
    println!("  Binary key size: {} bytes", buffer.len());
    println!("  Number of IC points: {}", vk.gamma_abc_g1.len());

    Ok(())
} 