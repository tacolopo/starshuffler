use std::process::Command;
use std::env;
use std::path::Path;
use std::fs;

fn main() {
    // Skip circuit compilation when running in the optimizer container
    if env::var("DOCKER_OPTIMIZER").is_ok() {
        println!("cargo:warning=Running in Docker optimizer - skipping circuit compilation");
        return;
    }

    println!("cargo:rerun-if-changed=circuit/circuits/merkleproof.circom");
    
    let circuit_path = Path::new("circuit/circuits/merkleproof.circom");
    if !circuit_path.exists() {
        println!("cargo:warning=Circuit file not found at: {}", circuit_path.display());
        return;
    }
    
    let circuit_dir = Path::new("circuit/circuits");
    let build_dir = Path::new("circuits/build");
    
    // Create build directory if it doesn't exist
    fs::create_dir_all(build_dir).expect("Failed to create build directory");
    
    // Compile circuit
    let status = Command::new("circom")
        .args(&[
            "merkleproof.circom",
            "--r1cs",
            "--wasm",
            "--sym",
            "-o",
            build_dir.to_str().unwrap(),
        ])
        .current_dir(circuit_dir)
        .status()
        .expect("Failed to compile circuit");

    if !status.success() {
        panic!("Failed to compile circuit");
    }

    // Generate proving and verification keys
    Command::new("snarkjs")
        .args(&[
            "groth16",
            "setup",
            &format!("{}/merkleproof.r1cs", build_dir.to_str().unwrap()),
            "circuit/build/circuits/pot16_final.ptau",
            &format!("{}/merkleproof_0.zkey", build_dir.to_str().unwrap()),
        ])
        .status()
        .expect("Failed to generate initial zkey");

    Command::new("snarkjs")
        .args(&[
            "zkey",
            "contribute",
            &format!("{}/merkleproof_0.zkey", build_dir.to_str().unwrap()),
            &format!("{}/merkleproof_final.zkey", build_dir.to_str().unwrap()),
            "--name=1st contribution",
            "-v",
        ])
        .status()
        .expect("Failed to contribute to zkey");

    // Export verification key directly to JSON format
    Command::new("snarkjs")
        .args(&[
            "zkey",
            "export",
            "verificationkey",
            &format!("{}/merkleproof_final.zkey", build_dir.to_str().unwrap()),
            &format!("{}/verification_key.json", build_dir.to_str().unwrap()),
        ])
        .status()
        .expect("Failed to export verification key");

    println!("cargo:warning=Circuit compilation and key generation completed successfully");
} 