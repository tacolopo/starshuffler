import { groth16 } from 'snarkjs';

export const generateProof = async (secret, root, nullifierHash, recipient) => {
  try {
    // Input for the circuit
    const input = {
      secret: secret,
      root: root,
      nullifierHash: nullifierHash,
      recipient: recipient,
    };

    // Load the circuit
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      "/circuits/merkleproof.wasm",
      "/circuits/merkleproof_final.zkey"
    );

    // Convert the proof to the format expected by the contract
    const proofForContract = [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][0],
      proof.pi_b[0][1],
      proof.pi_b[1][0],
      proof.pi_b[1][1],
      proof.pi_c[0],
      proof.pi_c[1],
    ].map(x => x.toString());

    return proofForContract;
  } catch (error) {
    console.error('Error generating proof:', error);
    throw new Error('Failed to generate zero-knowledge proof');
  }
}; 