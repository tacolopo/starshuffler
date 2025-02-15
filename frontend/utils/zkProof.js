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

// Helper function to pad hex strings to even length
const padHex = (hexStr) => {
  // Remove 0x prefix if present
  let hex = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
  // Add leading zero if odd length
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  return '0x' + hex;
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

    // Convert the proof to hex strings with proper padding
    const proofForContract = [
      // Convert pi_a points to hex strings
      proof.pi_a[0].toString(16),
      proof.pi_a[1].toString(16),
      // Convert pi_b points to hex strings (note the reversed order for each pair)
      proof.pi_b[0][1].toString(16),
      proof.pi_b[0][0].toString(16),
      proof.pi_b[1][1].toString(16),
      proof.pi_b[1][0].toString(16),
      // Convert pi_c points to hex strings
      proof.pi_c[0].toString(16),
      proof.pi_c[1].toString(16)
    ].map(x => {
      if (x.startsWith('-')) {
        return '-' + padHex(x.slice(1));
      }
      return padHex(x);
    });

    console.log('Proof for contract:', proofForContract);
    return proofForContract;
  } catch (error) {
    console.error('Error generating proof:', error);
    throw error;
  }
}; 