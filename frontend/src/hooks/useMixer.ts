import { useCallback, useState } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Note, MixerConfig, Proof } from '../types/Mixer';

export function useMixer(contractAddress: string, client?: SigningCosmWasmClient) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();

    const deposit = useCallback(async (amount: string, denom: string) => {
        if (!client) return;
        setLoading(true);
        try {
            // Generate note
            const note = await fetch('/api/generate-note', {
                method: 'POST',
                body: JSON.stringify({ amount, denom }),
            }).then(res => res.json());

            // Execute deposit
            const result = await client.execute(
                contractAddress,
                {
                    deposit: {
                        commitment: note.commitment,
                    },
                },
                'auto',
                '',
                [{
                    amount,
                    denom,
                }],
            );

            return { note, txHash: result.transactionHash };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [client, contractAddress]);

    const withdraw = useCallback(async (note: Note, proof: Proof) => {
        if (!client) return;
        setLoading(true);
        try {
            const result = await client.execute(
                contractAddress,
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

            return { txHash: result.transactionHash };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [client, contractAddress]);

    return { deposit, withdraw, loading, error };
} 