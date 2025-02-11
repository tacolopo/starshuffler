pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/mux1.circom";

template MerkleProof(nLevels) {
    signal input leaf;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];
    signal output root;

    component selectors[nLevels];
    component hashers[nLevels];

    signal levelHashes[nLevels + 1];
    levelHashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {
        selectors[i] = Mux1();
        selectors[i].c[0] <== levelHashes[i];
        selectors[i].c[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].out;
        hashers[i].inputs[1] <== pathElements[i];

        levelHashes[i + 1] <== hashers[i].out;
    }

    root <== levelHashes[nLevels];
}

component main = MerkleProof(20); 