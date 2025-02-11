export interface Note {
    nullifier: string;
    secret: string;
    commitment: string;
    recipient: string;
}

export interface MixerConfig {
    denomination: {
        amount: string;
        denom: string;
    };
    merkleTreeLevels: number;
    numDeposits: string;
}

export interface Proof {
    proof: string[];
    root: string;
    nullifierHash: string;
} 