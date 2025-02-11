#!/bin/bash
set -e # Exit on error

# Initialize npm if needed
if [ ! -f "package.json" ]; then
    npm init -y
fi

# Install dependencies
npm install circomlib@2.0.5 snarkjs

# Create powers of tau file
npx snarkjs powersoftau new bn128 12 pot12_0.ptau -v
echo "random entropy" | npx snarkjs powersoftau contribute pot12_0.ptau pot12_1.ptau --name="First contribution" -v
npx snarkjs powersoftau prepare phase2 pot12_1.ptau pot12_final.ptau -v

# Compile circuit
npx circom mixer.circom --r1cs --wasm --sym -l node_modules/circomlib/circuits

# Generate proving key and verification key
npx snarkjs groth16 setup mixer.r1cs pot12_final.ptau mixer_0.zkey
echo "more random entropy" | npx snarkjs zkey contribute mixer_0.zkey mixer_final.zkey --name="1st contribution" -v
npx snarkjs zkey export verificationkey mixer_final.zkey verification_key.json

# Convert verification key to binary format
node -e "const fs = require('fs'); const vk = require('./verification_key.json'); fs.writeFileSync('verification_key.bin', Buffer.from(JSON.stringify(vk)))" 