require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const circomlibjs = require('circomlibjs');
const { groth16 } = require('snarkjs');
const path = require('path');
const fs = require('fs');

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

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
});
app.use(limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

// Initialize CosmWasm client and Poseidon
let client;
let wallet;
let poseidon;

async function initializeClient() {
  try {
    // Initialize Poseidon
    poseidon = await circomlibjs.buildPoseidon();
    
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      process.env.RELAYER_MNEMONIC,
      { 
        prefix: 'juno',
      }
    );
    
    const [account] = await wallet.getAccounts();
    console.log(`Relayer address: ${account.address}`);
    
    client = await SigningCosmWasmClient.connectWithSigner(
      process.env.RPC_ENDPOINT,
      wallet,
      { 
        gasPrice: { 
          amount: "0.025",
          denom: "ujuno"
        },
        prefix: "juno",
        gasMultiplier: 2.0
      }
    );
    
    console.log('CosmWasm client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize client:', error);
    process.exit(1);
  }
}

// Load verification key
const verificationKey = JSON.parse(fs.readFileSync(path.join(__dirname, 'verification_key/verification_key.json')));
if (!verificationKey.vk_base64) {
    throw new Error('Invalid verification key format');
}

// Convert base64 verification key back to binary for proof verification
const vkBinary = Buffer.from(verificationKey.vk_base64, 'base64');

// Simplified validation function
function validateZkeyFile(filepath) {
  try {
    const stats = fs.statSync(filepath);
    console.log('zkey file validation:');
    console.log('- File exists:', fs.existsSync(filepath));
    console.log('- File size:', stats.size, 'bytes');
    console.log('- File permissions:', stats.mode.toString(8));
    console.log('- Absolute path:', path.resolve(filepath));
    
    // Read header
    const fd = fs.openSync(filepath, 'r');
    const buffer = Buffer.alloc(32);
    fs.readSync(fd, buffer, 0, 32, 0);
    console.log('- Header bytes:', buffer.toString('hex'));
    fs.closeSync(fd);
    return true;
  } catch (error) {
    console.error('zkey file validation failed:', error);
    return false;
  }
}

// Add this endpoint to handle both proof generation and withdrawal
app.post('/relay-withdrawal', async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note || !note.secret || !note.recipient) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Missing required parameters in note' 
      });
    }

    // Validate file but don't throw
    const zkeyPath = path.join(__dirname, 'build/circuits/mixer.zkey');
    console.log('\nValidating zkey file before proof generation...');
    validateZkeyFile(zkeyPath);

    // Generate nullifier hash from secret
    const secretBigInt = BigInt('0x' + note.secret);
    const nullifierHash = poseidon.F.toString(
      poseidon([secretBigInt])
    );

    // Get current merkle root from contract
    const root = await client.queryContractSmart(process.env.CONTRACT_ADDRESS, {
      get_merkle_root: {}
    });
    console.log('Current merkle root:', root);

    // Convert values to field elements
    const rootBigInt = BigInt(root || "0");
    console.log('Root as BigInt:', rootBigInt.toString());

    // Generate commitment from nullifier and secret
    const commitment = poseidon.F.toString(
      poseidon([secretBigInt, secretBigInt])  // Using secret as both nullifier and secret
    );
    console.log('Generated commitment:', commitment);

    // Generate circuit inputs with correct nullifier hash
    const input = {
      root: rootBigInt.toString(),
      nullifier: nullifierHash,  // Changed: Use nullifierHash instead of secret
      secret: secretBigInt.toString(),
      path_elements: Array(20).fill("0"),
      path_indices: Array(20).fill(0)
    };

    console.log('Circuit verification:');
    console.log('1. Circuit input structure:');
    console.log('- root (public):', input.root);
    console.log('- nullifier (public):', input.nullifier);
    console.log('- secret (private):', input.secret);
    console.log('- path_elements (private):', input.path_elements.slice(0, 3), '...');
    console.log('- path_indices (private):', input.path_indices.slice(0, 3), '...');

    console.log('\n2. Hash verification:');
    console.log('- Generated nullifier hash:', nullifierHash);
    console.log('- Input nullifier:', input.nullifier);
    console.log('- Generated commitment:', commitment);

    // Add this before proof generation
    console.log('\n3. Circuit file verification:');
    console.log('- WASM file exists:', fs.existsSync(path.join(__dirname, 'build/circuits/mixer.wasm')));
    console.log('- WASM file size:', fs.statSync(path.join(__dirname, 'build/circuits/mixer.wasm')).size);

    const { proof, publicSignals } = await groth16.prove(
      path.join(__dirname, 'build/circuits/mixer.wasm'),
      path.join(__dirname, 'build/circuits/mixer.zkey'),
      input
    );

    // Verify the proof locally before submitting
    const isValid = await groth16.verify(vkBinary, publicSignals, proof);
    if (!isValid) {
      throw new Error('Proof verification failed locally');
    }

    // Convert proof to contract format
    const proofHex = [
      proof.pi_a[0], proof.pi_a[1],
      proof.pi_b[0][0], proof.pi_b[0][1],
      proof.pi_b[1][0], proof.pi_b[1][1],
      proof.pi_c[0], proof.pi_c[1]
    ].map(x => x.toString(16)).join('');

    // Execute withdrawal with the real proof
    const [account] = await wallet.getAccounts();
    console.log('Sending withdrawal with:', {
      proof: [proofHex],
      root: rootBigInt.toString(),
      nullifier_hash: nullifierHash,
      recipient: note.recipient
    });

    const result = await client.execute(
      account.address,
      process.env.CONTRACT_ADDRESS,
      {
        withdraw: {
          proof: [proofHex],
          root: rootBigInt.toString(),
          nullifier_hash: nullifierHash,
          recipient: note.recipient
        }
      },
      {
        amount: [{
          amount: "75000",
          denom: "ujuno"
        }],
        gas: "1000000"
      }
    );

    res.json({
      success: true,
      txHash: result.transactionHash
    });
  } catch (error) {
    console.error('Relay withdrawal error:', error);
    
    res.status(500).json({
      error: 'Failed to process withdrawal',
      details: error.message,
      type: error.name
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;

// Initialize client and start server
initializeClient().then(() => {
  app.listen(PORT, () => {
    console.log(`Relayer server running on port ${PORT}`);
  });
}); 