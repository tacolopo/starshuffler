require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');

const app = express();
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS)
});
app.use(limiter);

// Initialize CosmWasm client
let client;
let wallet;

async function initializeClient() {
  try {
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      process.env.RELAYER_MNEMONIC,
      { prefix: 'juno' }
    );
    
    const [account] = await wallet.getAccounts();
    console.log(`Relayer address: ${account.address}`);
    
    client = await SigningCosmWasmClient.connectWithSigner(
      process.env.RPC_ENDPOINT,
      wallet
    );
    
    console.log('CosmWasm client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize client:', error);
    process.exit(1);
  }
}

// Withdrawal endpoint
app.post('/withdraw', async (req, res) => {
  try {
    const { proof, root, nullifierHash, recipient } = req.body;
    
    if (!proof || !root || !nullifierHash || !recipient) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify the nullifier hasn't been used
    const isUsed = await client.queryContractSmart(process.env.CONTRACT_ADDRESS, {
      is_nullifier_used: { nullifier_hash: nullifierHash }
    });

    if (isUsed) {
      return res.status(400).json({ error: 'Nullifier has already been used' });
    }

    // Execute withdrawal
    const result = await client.execute(
      process.env.CONTRACT_ADDRESS,
      {
        withdraw: {
          proof,
          root,
          nullifier_hash: nullifierHash,
          recipient
        }
      },
      'auto'
    );

    res.json({
      success: true,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      error: 'Failed to process withdrawal',
      details: error.message
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