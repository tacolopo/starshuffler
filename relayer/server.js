require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const circomlibjs = require('circomlibjs');
const { groth16 } = require('snarkjs');
const path = require('path');

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
        gasMultiplier: 1.3
      }
    );
    
    console.log('CosmWasm client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize client:', error);
    process.exit(1);
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

    // Generate nullifier hash from secret
    const secretBigInt = BigInt('0x' + note.secret);
    const nullifierHash = poseidon.F.toString(
      poseidon([secretBigInt])
    );

    // Get current merkle root from contract
    const root = await client.queryContractSmart(process.env.CONTRACT_ADDRESS, {
      get_merkle_root: {}
    });

    // Convert values to field elements
    const rootBigInt = BigInt(root);

    // Generate commitment from nullifier and secret
    const commitment = poseidon.F.toString(
      poseidon([secretBigInt, secretBigInt])  // Using secret as both nullifier and secret for now
    );

    // Generate ZK proof
    const input = {
      leaf: commitment,
      pathElements: Array(20).fill("0"), // TODO: Get actual merkle path
      pathIndices: Array(20).fill(0)     // TODO: Get actual indices
    };

    console.log('Circuit inputs:', input);

    const wasmPath = path.join(__dirname, '../circuit/build/circuits/merkleproof_js/merkleproof.wasm');
    const zkeyPath = path.join(__dirname, '../circuit/build/circuits/merkleproof_final.zkey');

    console.log('Loading circuit files from:', { wasmPath, zkeyPath });
    const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);

    // Convert proof to contract format
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

    // Execute withdrawal with the real proof
    const [account] = await wallet.getAccounts();
    const result = await client.execute(
      account.address,
      process.env.CONTRACT_ADDRESS,
      {
        withdraw: {
          proof: [proofHex],
          root,
          nullifier_hash: nullifierHash,
          recipient: note.recipient
        }
      },
      "auto",
      undefined,
      []
    );

    res.json({
      success: true,
      txHash: result.transactionHash
    });
  } catch (error) {
    console.error('Relay withdrawal error:', error);
    
    // Send a more detailed error response
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