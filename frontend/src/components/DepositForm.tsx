import React, { useState } from 'react';
import { useMixer } from '../hooks/useMixer';

export function DepositForm({ config }: { config: MixerConfig }) {
    const { deposit, loading } = useMixer();
    const [recipient, setRecipient] = useState('');
    const [note, setNote] = useState<Note>();

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await deposit(
            config.denomination.amount,
            config.denomination.denom
        );
        if (result?.note) {
            setNote(result.note);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <form onSubmit={handleDeposit}>
                <h2 className="text-2xl mb-4">Deposit {config.denomination.amount} {config.denomination.denom}</h2>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {loading ? 'Processing...' : 'Deposit'}
                </button>
            </form>
            
            {note && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p className="text-sm break-all">
                        Save this note securely! You'll need it to withdraw:
                        <br />
                        {JSON.stringify(note, null, 2)}
                    </p>
                </div>
            )}
        </div>
    );
} 