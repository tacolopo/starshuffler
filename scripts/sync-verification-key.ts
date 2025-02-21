import * as fs from 'fs';
import * as path from 'path';

// Read the binary verification key
const binPath = path.join(__dirname, '../src/verification_key/verification_key.bin');
const jsonPath = path.join(__dirname, '../src/verification_key/verification_key.json');

// Read the binary file
const binData = fs.readFileSync(binPath);

// Convert to base64 and then to JSON
const base64Data = binData.toString('base64');
const jsonData = {
    protocol: "groth16",
    curve: "bn128",
    nPublic: 2, // Based on the circuit
    vk_base64: base64Data
};

// Write it back as formatted JSON
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

console.log('Verification key JSON updated successfully'); 