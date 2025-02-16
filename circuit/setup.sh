#!/bin/bash
set -e # Exit on error

echo "Cleaning up previous build..."
rm -rf build *.ptau *.zkey *.r1cs *.sym *.wasm verification_key.json

echo "Creating build directory..."
mkdir -p build/circuits
mkdir -p build/contract
mkdir -p ../src/verification_key

echo "Installing dependencies..."
npm install

echo "Compiling circuit..."
circom mixer.circom \
  --r1cs \
  --wasm \
  --sym \
  -o build/circuits

echo "Downloading powers of tau..."
curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -o build/circuits/pot16_final.ptau

echo "Generating proving key..."
cd build/circuits

echo "Running setup..."
snarkjs zkey new mixer.r1cs pot16_final.ptau mixer_0.zkey
snarkjs zkey contribute mixer_0.zkey mixer_final.zkey --name="1st contribution" -v
snarkjs zkey export verificationkey mixer_final.zkey verification_key.json

echo "Converting verification key formats..."
cd ../.. # Return to circuit directory
cp build/circuits/verification_key.json .
npx ts-node setup.ts

echo "Setup complete!" 