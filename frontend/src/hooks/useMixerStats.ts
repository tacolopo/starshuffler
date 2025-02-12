import { useState, useEffect } from 'react';

interface MixerStats {
    numDeposits: number;
    anonymitySetSize: number;
    currentRoot: string;
}

export function useMixerStats() {
    const [stats, setStats] = useState<MixerStats>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement stats fetching
        setLoading(false);
    }, []);

    return { stats, loading };
} 