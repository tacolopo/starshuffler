import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://rpc-juno.itastakers.com";
const MNEMONIC = process.env.DEPLOYER_MNEMONIC!;
const MIXER_DENOMINATION = process.env.MIXER_DENOMINATION || "ujuno";
const MIXER_AMOUNT = process.env.MIXER_AMOUNT || "1000000";

async function deploy() {
    // Setup wallet and client
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
        prefix: "juno",
    });
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet);
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
        denomination: {
            amount: MIXER_AMOUNT,
            denom: MIXER_DENOMINATION,
        },
        merkle_tree_levels: 20,
    };

    const contract = await client.instantiate(
        account.address,
        uploadResult.codeId,
        instantiateMsg,
        "Juno Privacy Mixer",
        "auto"
    );

    console.log(`Contract instantiated at address: ${contract.contractAddress}`);

    // Save contract address to .env file
    const envAddition = `\nCONTRACT_ADDRESS=${contract.contractAddress}`;
    require('fs').appendFileSync('.env', envAddition);
}

deploy().catch(console.error); 