import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { readFileSync, existsSync } from "fs";
import * as dotenv from "dotenv";
import path from 'path';

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://rpc-juno.itastakers.com";
const MNEMONIC = process.env.DEPLOYER_MNEMONIC!;
const MIXER_DENOMINATION = process.env.MIXER_DENOMINATION || "ujuno";
const MIXER_AMOUNT = process.env.MIXER_AMOUNT || "1000000";
const GAS_PRICE = GasPrice.fromString("0.09ujuno");

async function deploy() {
    // Check verification key exists
    const verificationKeyPath = path.join(__dirname, '../src/verification_key/verification_key.json');
    if (!existsSync(verificationKeyPath)) {
        throw new Error('Verification key not found at: ' + verificationKeyPath + '. Please run `npm run setup-circuit` first.');
    }

    // Read and validate verification key
    const verificationKey = JSON.parse(readFileSync(verificationKeyPath, 'utf8'));
    if (!verificationKey.protocol || verificationKey.protocol !== 'groth16') {
        throw new Error('Invalid verification key format');
    }

    // Setup wallet and client
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
        prefix: "juno",
    });
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, {
        gasPrice: GAS_PRICE
    });
    const [account] = await wallet.getAccounts();

    console.log(`Deploying from account: ${account.address}`);

    // Upload contract code
    const wasmBinary = readFileSync("artifacts/juno_privacy_mixer.wasm");
    const uploadResult = await client.upload(
        account.address,
        wasmBinary,
        "auto"
    );
    console.log(`Contract code uploaded with code ID: ${uploadResult.codeId}`);

    // Instantiate the contract
    const instantiateMsg = {
        merkle_tree_levels: 20,
        denomination: {
            denom: MIXER_DENOMINATION,
            amount: MIXER_AMOUNT
        }
    };

    const contract = await client.instantiate(
        account.address,
        uploadResult.codeId,
        instantiateMsg,
        "Test",
        {
            amount: [{
                amount: "3750000",
                denom: "ujuno"
            }],
            gas: "50000000"
        },
        {
            admin: account.address,
            funds: [{ amount: MIXER_AMOUNT, denom: MIXER_DENOMINATION }]
        }
    );

    console.log(`Contract instantiated at address: ${contract.contractAddress}`);

    // Save contract address to .env file
    const envAddition = `\nCONTRACT_ADDRESS=${contract.contractAddress}`;
    require('fs').appendFileSync('.env', envAddition);
}

deploy().catch(console.error); 