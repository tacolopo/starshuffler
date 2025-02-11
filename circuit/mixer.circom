pragma circom 2.0.0;

include "poseidon.circom";
include "merkleproof.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== left;
    hasher.inputs[1] <== right;
    hash <== hasher.out;
}

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component hashers[levels];
    component selectors[levels];

    signal levelHashes[levels + 1];
    levelHashes[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        hashers[i] = HashLeftRight();
        selectors[i] = IsEqual();
        selectors[i].in[0] <== pathIndices[i];
        selectors[i].in[1] <== 0;

        hashers[i].left <== selectors[i].out * (levelHashes[i] - pathElements[i]) + pathElements[i];
        hashers[i].right <== selectors[i].out * (pathElements[i] - levelHashes[i]) + levelHashes[i];

        levelHashes[i + 1] <== hashers[i].hash;
    }

    // Check root
    root === levelHashes[levels];
}

template Mixer() {
    signal input root;
    signal input nullifier;
    signal input secret;
    signal input path_elements[20];
    signal input path_indices[20];
    
    signal output nullifier_hash;
    
    // Hash nullifier and secret to get commitment
    component hasher = Poseidon(2);
    hasher.inputs[0] <== nullifier;
    hasher.inputs[1] <== secret;
    signal commitment <== hasher.out;
    
    // Verify merkle proof
    component merkle_proof = MerkleProof(20);
    merkle_proof.leaf <== commitment;
    merkle_proof.root <== root;
    for (var i = 0; i < 20; i++) {
        merkle_proof.path_elements[i] <== path_elements[i];
        merkle_proof.path_indices[i] <== path_indices[i];
    }
    
    // Calculate nullifier hash
    component nullifier_hasher = Poseidon(1);
    nullifier_hasher.inputs[0] <== nullifier;
    nullifier_hash <== nullifier_hasher.out;
}

component main = Mixer(); 