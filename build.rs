use std::process::Command;
use std::env;
use std::path::Path;

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
    
    let out_dir = env::var("OUT_DIR").unwrap();
    let circuit_dir = Path::new("circuit/circuits");
    
    // Compile circuit
    let status = Command::new("circom")
        .args(&[
            "merkleproof.circom",
            "--r1cs",
            "--wasm",
            "--sym",
            "-o",
            &out_dir,
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
            &format!("{}/merkleproof.r1cs", out_dir),
            "circuit/build/circuits/pot16_final.ptau",
            &format!("{}/merkleproof_0.zkey", out_dir),
        ])
        .status()
        .expect("Failed to generate initial zkey");

    Command::new("snarkjs")
        .args(&[
            "zkey",
            "contribute",
            &format!("{}/merkleproof_0.zkey", out_dir),
            &format!("{}/merkleproof_final.zkey", out_dir),
            "--name=1st contribution",
            "-v",
        ])
        .status()
        .expect("Failed to contribute to zkey");

    Command::new("snarkjs")
        .args(&[
            "zkey",
            "export",
            "verificationkey",
            &format!("{}/merkleproof_final.zkey", out_dir),
            &format!("{}/verification_key.json", out_dir),
        ])
        .status()
        .expect("Failed to export verification key");
} 