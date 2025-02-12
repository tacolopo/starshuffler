import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export interface MixerConfig {
    denomination: {
        amount: string;
        denom: string;
    };
    merkleTreeLevels: number;
    numDeposits: string;
    client: SigningCosmWasmClient;
    contractAddress: string;
}

export interface Note {
    nullifier: string;
    secret: string;
    recipient: string;
} 