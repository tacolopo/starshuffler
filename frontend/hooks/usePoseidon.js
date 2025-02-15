import { useState, useEffect } from 'react';

export function usePoseidon() {
  const [poseidon, setPoseidon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initPoseidon = async () => {
      try {
        if (typeof window === 'undefined') return;

        setIsLoading(true);
        const { buildPoseidon } = await import('circomlibjs');
        const poseidonInstance = await buildPoseidon();
        
        if (mounted) {
          setPoseidon(poseidonInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize Poseidon:', err);
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    initPoseidon();

    return () => {
      mounted = false;
    };
  }, []);

  return { poseidon, isLoading, error };
} 