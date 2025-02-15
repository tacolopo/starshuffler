#!/bin/bash
set -e # Exit on error

echo "Cleaning up previous build..."
rm -rf build node_modules package-lock.json

echo "Creating build directory..."
mkdir -p build/circuits
mkdir -p build/contract

# Create circuits directory if it doesn't exist
mkdir -p circuits

echo "Using existing merkleproof circuit in circuits folder..."

echo "Installing dependencies..."
npm install circomlib snarkjs ts-node typescript @types/node

echo "Compiling circuit..."
circom circuits/merkleproof.circom \
  --r1cs \
  --wasm \
  --sym \
  -l node_modules \
  -o build/circuits

echo "Downloading powers of tau..."
curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -o build/circuits/pot16_final.ptau

echo "Generating proving key..."
cd build/circuits
snarkjs groth16 setup merkleproof.r1cs pot16_final.ptau merkleproof_0.zkey
snarkjs zkey contribute merkleproof_0.zkey merkleproof_final.zkey --name="1st contribution" -v
snarkjs zkey export verificationkey merkleproof_final.zkey verification_key.json

echo "Converting verification key formats..."
# Convert the verification key to binary format
cd ../.. # Return to circuit directory
npx ts-node setup.ts

echo "Setup complete!" 