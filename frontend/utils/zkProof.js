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

// Helper function to format a field element to 32 bytes in big-endian hex
const formatFieldElement = (n) => {
  let hex = BigInt(n).toString(16).padStart(64, '0');
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return hex;
};

// Helper function to convert a hex string (without 0x) from big-endian to little-endian
const toLEHex = (hexStr) => {
  const bytes = hexStr.match(/.{2}/g);
  return bytes.reverse().join('');
};

export const generateProof = async (secret, commitment, allCommitments, recipient) => {
  try {
    console.log('Generating proof with inputs:', { secret, commitment, recipient });
    if (!secret) throw new Error('Secret is undefined');
    if (!commitment) throw new Error('Commitment is undefined');
    if (!recipient) throw new Error('Recipient is undefined');

    const secretBigInt = BigInt('0x' + secret);
    console.log('Generating Merkle proof...');
    const merkleProof = await createMerkleProof(commitment, allCommitments);
    console.log('Merkle proof:', merkleProof);

    const input = {
      leaf: secretBigInt.toString(),
      pathElements: merkleProof.pathElements,
      pathIndices: merkleProof.pathIndices
    };
    console.log('Circuit inputs:', input);

    const baseUrl = window.location.origin;
    const wasmPath = `${baseUrl}/merkleproof_js/merkleproof.wasm`;
    const zkeyPath = `${baseUrl}/merkleproof_final.zkey`;
    console.log('Loading circuit files from:', { wasmPath, zkeyPath });

    const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);

    // Convert each proof element to little-endian hex string
    const proofHex = [
      toLEHex(formatFieldElement(proof.pi_a[0])),
      toLEHex(formatFieldElement(proof.pi_a[1])),
      toLEHex(formatFieldElement(proof.pi_b[0][0])),
      toLEHex(formatFieldElement(proof.pi_b[0][1])),
      toLEHex(formatFieldElement(proof.pi_b[1][0])),
      toLEHex(formatFieldElement(proof.pi_b[1][1])),
      toLEHex(formatFieldElement(proof.pi_c[0])),
      toLEHex(formatFieldElement(proof.pi_c[1]))
    ].join('');

    console.log('Proof hex:', proofHex);
    return [proofHex];
  } catch (error) {
    console.error('Error generating proof:', error);
    throw error;
  }
}; 