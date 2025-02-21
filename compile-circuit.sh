#!/bin/bash

cd circuit

# Compile the circuit
echo "Compiling circuit..."
circom mixer.circom --r1cs --wasm --sym

# Generate the proving key
echo "Generating initial proving key..."
snarkjs groth16 setup mixer.r1cs pot14_final.ptau mixer_0.zkey

# Contribute to the phase 2 ceremony
echo "Contributing to phase 2 ceremony..."
echo "test" | snarkjs zkey contribute mixer_0.zkey mixer_1.zkey --name="1st contribution" -v

# Export verification key
echo "Exporting verification key..."
snarkjs zkey export verificationkey mixer_1.zkey verification_key.json

# Create the Solidity verifier
echo "Generating Solidity verifier..."
snarkjs zkey export solidityverifier mixer_1.zkey verifier.sol

# Copy the final zkey to the build directory
echo "Setting up build directory..."
mkdir -p ../build/circuits/
cp mixer_1.zkey ../build/circuits/mixer.zkey
cp verification_key.json ../build/circuits/

echo "Circuit compilation completed!"
