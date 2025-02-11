import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const MNEMONIC = process.env.RELAYER_MNEMONIC!;
const RPC_URL = process.env.RPC_URL || 'https://rpc-juno.itastakers.com';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

async function setupClient() {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
        prefix: 'juno',
    });
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet);
    return client;
}

let client: SigningCosmWasmClient;

app.post('/api/relay-withdrawal', async (req, res) => {
    try {
        const { note, proof } = req.body;

        if (!client) {
            client = await setupClient();
        }

        const result = await client.execute(
            CONTRACT_ADDRESS,
            {
                withdraw: {
                    nullifier_hash: proof.nullifierHash,
                    root: proof.root,
                    proof: proof.proof,
                    recipient: note.recipient,
                },
            },
            'auto',
        );

        res.json({ 
            success: true, 
            txHash: result.transactionHash 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(3001, () => {
    console.log('Relayer service running on port 3001');
}); 