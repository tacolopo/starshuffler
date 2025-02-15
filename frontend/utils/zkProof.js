import { groth16 } from 'snarkjs';
import { createMerkleProof } from './merkleTree';

const addressToNumber = (address) => {
  // Remove the 'juno' prefix
  const addressWithoutPrefix = address.replace('juno', '');
  
  // Convert the remaining characters to a number
  let result = '';
  for (let i = 0; i < addressWithoutPrefix.length; i++) {
    result += addressWithoutPrefix.charCodeAt(i).toString(16);
  }
  return BigInt('0x' + result);
};

export const generateProof = async (secret, commitment, allCommitments, recipient) => {
  try {
    console.log('Generating proof with inputs:', {
      secret,
      commitment,
      recipient
    });

    if (!secret) throw new Error('Secret is undefined');
    if (!commitment) throw new Error('Commitment is undefined');
    if (!recipient) throw new Error('Recipient is undefined');

    // Convert secret to BigInt
    const secretBigInt = BigInt('0x' + secret);

    // Generate Merkle proof
    console.log('Generating Merkle proof...');
    const merkleProof = await createMerkleProof(commitment, allCommitments);
    console.log('Merkle proof:', merkleProof);

    // Input for the circuit - only include what the circuit expects
    const input = {
      leaf: secretBigInt.toString(),
      pathElements: merkleProof.pathElements,
      pathIndices: merkleProof.pathIndices
    };

    console.log('Circuit inputs:', input);

    // Get the base URL for the current page
    const baseUrl = window.location.origin;
    const wasmPath = `${baseUrl}/merkleproof_js/merkleproof.wasm`;
    const zkeyPath = `${baseUrl}/merkleproof_final.zkey`;

    console.log('Loading circuit files from:', { wasmPath, zkeyPath });

    // Generate the proof using the wasm and zkey URLs
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
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