import { groth16 } from 'snarkjs';

export const generateProof = async (secret, root, nullifierHash, recipient) => {
  try {
    console.log('Generating proof with inputs:', {
      secret,
      root,
      nullifierHash,
      recipient
    });

    if (!secret) throw new Error('Secret is undefined');
    if (!root) throw new Error('Root is undefined');
    if (!nullifierHash) throw new Error('NullifierHash is undefined');
    if (!recipient) throw new Error('Recipient is undefined');

    // Convert inputs to appropriate format
    const secretBigInt = BigInt('0x' + secret);
    const rootBigInt = BigInt(root);
    const nullifierHashBigInt = BigInt(nullifierHash);
    const recipientBigInt = BigInt(recipient.replace('juno', '0x'));

    // Input for the circuit
    const input = {
      secret: secretBigInt.toString(),
      root: rootBigInt.toString(),
      nullifierHash: nullifierHashBigInt.toString(),
      recipient: recipientBigInt.toString(),
    };

    console.log('Circuit inputs:', input);

    // Load the circuit
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      "/circuits/merkleproof.wasm",
      "/circuits/merkleproof_final.zkey"
    );

    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);

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
    throw error;
  }
}; 