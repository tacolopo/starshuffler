// Add type declaration for circomlibjs
declare module 'circomlibjs' {
    export function buildPoseidon(): Promise<any>;
}

const { buildPoseidon } = require("circomlibjs");
const cryptoNode = require("crypto");
const { BigNumber } = require("@ethersproject/bignumber");
const childProcess = require("child_process");
const fs = require("fs");

// Helper to generate random field elements
const randomFieldElement = () => {
    const bytes = cryptoNode.randomBytes(31); // 31 bytes to ensure it's less than field size
    return BigNumber.from(bytes).toString();
};

async function testMixer() {
    console.log("Loading Poseidon hasher...");
    const poseidon = await buildPoseidon();

    // Generate random values for deposit
    console.log("\nGenerating deposit values...");
    const secret = randomFieldElement();
    const nullifier = randomFieldElement();
    console.log("Secret:", secret);
    console.log("Nullifier:", nullifier);

    // Calculate commitment
    const commitment = poseidon.F.toString(
        poseidon([nullifier, secret])
    );
    console.log("Commitment:", commitment);

    // Create a simple Merkle tree with just our commitment
    // For testing, we'll use a tree with height 1 (2 leaves)
    const zero = "0";
    const root = poseidon.F.toString(
        poseidon([commitment, zero])
    );
    console.log("\nMerkle Tree:");
    console.log("Root:", root);
    console.log("Left leaf (commitment):", commitment);
    console.log("Right leaf (zero):", zero);

    // Prepare inputs for the proof
    const input = {
        root: root,
        nullifier: nullifier,
        secret: secret,
        path_elements: Array(20).fill(zero),  // Fill all 20 levels with zero
        path_indices: Array(20).fill(0)       // Use left path all the way up
    };

    // Save input for the proof generation
    console.log("\nGenerating proof...");
    fs.writeFileSync(
        "build/circuits/input.json",
        JSON.stringify(input, null, 2)
    );

    // Generate the proof
    process.chdir("build/circuits");
    childProcess.execSync("node mixer_js/generate_witness.js mixer_js/mixer.wasm input.json witness.wtns");
    childProcess.execSync("snarkjs groth16 prove mixer_final.zkey witness.wtns proof.json public.json");
    
    // Verify the proof
    console.log("\nVerifying proof...");
    const result = childProcess.execSync("snarkjs groth16 verify verification_key.json public.json proof.json").toString();
    
    console.log(result);
    
    // Calculate nullifier hash for verification
    const nullifier_hash = poseidon.F.toString(
        poseidon([nullifier])
    );
    console.log("\nNullifier hash:", nullifier_hash);
    
    // Print public inputs for verification
    console.log("\nPublic inputs from proof:");
    const publicInputs = JSON.parse(fs.readFileSync("public.json", "utf8"));
    console.log(publicInputs);

    process.chdir("../..");
}

testMixer().catch(console.error); 