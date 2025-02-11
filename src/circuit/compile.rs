use std::process::Command;
use tempfile::tempdir;
use std::fs;

pub fn compile_and_generate_proof(
    inputs: serde_json::Value,
    witness_gen: &[u8],
    proving_key: &[u8],
) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let dir = tempdir()?;
    
    // Write inputs
    let input_path = dir.path().join("input.json");
    fs::write(&input_path, serde_json::to_string(&inputs)?)?;
    
    // Write witness generator
    let witness_gen_path = dir.path().join("witness_gen.wasm");
    fs::write(&witness_gen_path, witness_gen)?;
    
    // Write proving key
    let pk_path = dir.path().join("proving_key.zkey");
    fs::write(&pk_path, proving_key)?;
    
    // Generate witness
    Command::new("snarkjs")
        .args(&[
            "wtns",
            "calculate",
            witness_gen_path.to_str().unwrap(),
            input_path.to_str().unwrap(),
            "witness.wtns",
        ])
        .current_dir(dir.path())
        .status()?;
    
    // Generate proof
    Command::new("snarkjs")
        .args(&[
            "groth16",
            "prove",
            pk_path.to_str().unwrap(),
            "witness.wtns",
            "proof.json",
            "public.json",
        ])
        .current_dir(dir.path())
        .status()?;
    
    // Read and return proof
    let proof = fs::read(dir.path().join("proof.json"))?;
    Ok(proof)
} 