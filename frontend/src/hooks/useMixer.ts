import { useCallback, useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Note } from '../types/Mixer';
import { MixerConfig } from '../types';
import { Proof } from '../types/Mixer';

export function useMixer(config: MixerConfig) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    const deposit = useCallback(async (amount: string, denom: string) => {
        if (!config.client) return;
        setLoading(true);
        try {
            // Generate note
            const note = await fetch('/api/generate-note', {
                method: 'POST',
                body: JSON.stringify({ amount, denom }),
            }).then(res => res.json());

            // Execute deposit
            const result = await config.client.execute(
                config.contractAddress,
                JSON.stringify({
                    deposit: {
                        commitment: note.commitment,
                    }
                }),
                [{
                    amount,
                    denom,
                }],
                "auto",
                ""
            );

            return { note, txHash: result.transactionHash };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [config.client, config.contractAddress]);

    const withdraw = useCallback(async (note: Note, proof: Proof) => {
        if (!config.client) return;
        setLoading(true);
        try {
            const result = await config.client.execute(
                config.contractAddress,
                JSON.stringify({
                    withdraw: {
                        nullifier_hash: proof.nullifierHash,
                        root: proof.root,
                        proof: proof.proof,
                        recipient: note.recipient,
                    }
                }),
                [],
                "auto",
                ""
            );

            return { txHash: result.transactionHash };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [config.client, config.contractAddress]);

    return { deposit, withdraw, loading, error };
} 