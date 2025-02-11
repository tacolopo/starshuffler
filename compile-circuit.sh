#!/bin/bash

cd circuit

# Compile the circuit
circom mixer.circom --r1cs --wasm --sym

# Generate the proving key and verification key
snarkjs groth16 setup mixer.r1cs pot12_final.ptau mixer_0.zkey
snarkjs zkey contribute mixer_0.zkey mixer_final.zkey --name="1st contribution" -v
snarkjs zkey export verificationkey mixer_final.zkey verification_key.json

# Convert verification key to binary format for the contract
node -e "const fs = require('fs'); const vk = require('./verification_key.json'); fs.writeFileSync('verification_key.bin', Buffer.from(JSON.stringify(vk)))"
