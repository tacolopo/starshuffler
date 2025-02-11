import React from 'react';
import { useMixerStats } from '../hooks/useMixerStats';

export function MixerStatus() {
    const { stats, loading } = useMixerStats();
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold">Mixer Status</h3>
            <div className="mt-2 space-y-2">
                <p>Total Deposits: {stats?.numDeposits || 0}</p>
                <p>Anonymity Set Size: {stats?.anonymitySetSize || 0}</p>
                <p>Current Root: {stats?.currentRoot || 'None'}</p>
            </div>
        </div>
    );
} 