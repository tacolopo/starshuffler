import React, { useState } from 'react';
import { useMixer } from '../hooks/useMixer';
import { MixerConfig } from '../types';

export function WithdrawForm({ config }: { config: MixerConfig }) {
    const { withdraw, loading } = useMixer(config);
    const [noteString, setNoteString] = useState('');
    const [status, setStatus] = useState('');

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const note = JSON.parse(noteString);
            
            // Generate proof through relayer
            const proofResult = await fetch('/api/generate-proof', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note }),
            }).then(res => res.json());

            if (proofResult.error) {
                throw new Error(proofResult.error);
            }

            // Submit withdrawal through relayer
            const result = await fetch('/api/relay-withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note,
                    proof: proofResult.proof,
                }),
            }).then(res => res.json());

            setStatus(`Withdrawal successful! TX: ${result.txHash}`);
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <form onSubmit={handleWithdraw}>
                <h2 className="text-2xl mb-4">Withdraw</h2>
                <textarea
                    value={noteString}
                    onChange={(e) => setNoteString(e.target.value)}
                    placeholder="Paste your note here..."
                    className="w-full h-32 p-2 border rounded"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                >
                    {loading ? 'Processing...' : 'Withdraw'}
                </button>
            </form>
            
            {status && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p>{status}</p>
                </div>
            )}
        </div>
    );
} 