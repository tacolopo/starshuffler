use std::process::Command;
use std::env;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=circuit/mixer.circom");
    
    let circuit_path = Path::new("circuit/mixer.circom");
    if !circuit_path.exists() {
        println!("cargo:warning=Circuit file not found, skipping compilation");
        return;
    }
    
    let out_dir = env::var("OUT_DIR").unwrap();
    let circuit_dir = Path::new("circuit");
    
    // Compile circuit
    Command::new("circom")
        .args(&[
            "mixer.circom",
            "--r1cs",
            "--wasm",
            "--sym",
            "-o",
            &out_dir,
        ])
        .current_dir(circuit_dir)
        .status()
        .expect("Failed to compile circuit");

    // Generate proving and verification keys
    Command::new("snarkjs")
        .args(&[
            "groth16",
            "setup",
            &format!("{}/mixer.r1cs", out_dir),
            "circuit/pot12_final.ptau",
            &format!("{}/mixer_0.zkey", out_dir),
        ])
        .status()
        .expect("Failed to generate initial zkey");

    Command::new("snarkjs")
        .args(&[
            "zkey",
            "contribute",
            &format!("{}/mixer_0.zkey", out_dir),
            &format!("{}/mixer_final.zkey", out_dir),
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
            &format!("{}/mixer_final.zkey", out_dir),
            &format!("{}/verification_key.json", out_dir),
        ])
        .status()
        .expect("Failed to export verification key");
} 