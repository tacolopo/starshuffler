use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=src/verification_key/verification_key.bin");
    println!("cargo:rerun-if-changed=circuit/setup.ts");
    println!("cargo:rerun-if-changed=circuit/setup.sh");

    // Get the output directory
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir);

    // Skip circuit setup in debug mode
    if env::var("PROFILE").unwrap() == "debug" {
        println!("cargo:warning=Debug mode - skipping circuit setup");
    }

    // Verify the verification key exists
    let vk_path = Path::new("src/verification_key/verification_key.bin");
    if !vk_path.exists() {
        panic!("Verification key not found at {:?}. Please run `npm run setup-circuit` first", vk_path);
    }

    // Read and validate the verification key
    let vk_bytes = fs::read(vk_path).expect("Failed to read verification key");
    if vk_bytes.len() != 296 {  // Expected size for compressed format
        panic!("Invalid verification key size: {} bytes (expected 296)", vk_bytes.len());
    }

    // Copy the verification key to the output directory
    let target_path = target_dir.join("verification_key.bin");
    fs::write(&target_path, &vk_bytes).expect("Failed to copy verification key");

    println!("cargo:warning=Verification key bundled successfully ({} bytes)", vk_bytes.len());
} 