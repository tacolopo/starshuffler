#!/bin/bash
set -e

# Create build directory
echo "Creating build directory..."
mkdir -p build/circuits

# Compile the circuit
echo "Compiling circuit..."
circom mixer.circom --r1cs --wasm --sym -o build/circuits

# Download powers of tau and generate proving key
echo "Downloading powers of tau..."
curl -L -o build/circuits/pot15_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau

echo "Generating proving key..."
cd build/circuits
snarkjs groth16 setup mixer.r1cs pot15_final.ptau mixer_0.zkey
snarkjs zkey contribute mixer_0.zkey mixer_final.zkey --name="1st contribution" -v
snarkjs zkey export verificationkey mixer_final.zkey verification_key.json

# Convert verification key to binary format for the contract
echo "Converting verification key to binary format..."
cd ../../..  # Go back to project root
mkdir -p src/verification_key
cargo run --bin convert_verification_key

echo "Setup complete!" 