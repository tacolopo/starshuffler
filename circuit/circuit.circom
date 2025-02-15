pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/merkleproof.circom";

template Mixer() {
    signal input root;
    signal input nullifierHash;
    signal input nullifier;
    signal input secret;
    signal input pathElements[20];
    signal input pathIndices[20];

    // Compute commitment
    component hasher = Poseidon(2);
    hasher.inputs[0] <== nullifier;
    hasher.inputs[1] <== secret;
    signal commitment;
    commitment <== hasher.out;

    // Verify merkle proof
    component merkleProof = MerkleProof(20);
    merkleProof.leaf <== commitment;
    merkleProof.root <== root;
    for (var i = 0; i < 20; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }

    // Compute nullifier hash
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHash === nullifierHasher.out;
}

component main = Mixer();
