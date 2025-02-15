import { createContext, useContext, useState, useEffect } from 'react';
import { Box, VStack, Spinner, Text, Alert, AlertIcon } from '@chakra-ui/react';

const PoseidonContext = createContext(null);

export function PoseidonProvider({ children }) {
  const [state, setState] = useState({
    poseidon: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadPoseidon = async () => {
      try {
        const { buildPoseidon } = await import('circomlibjs');
        const poseidonInstance = await buildPoseidon();
        setState({
          poseidon: poseidonInstance,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Failed to initialize Poseidon:', err);
        setState({
          poseidon: null,
          isLoading: false,
          error: err
        });
      }
    };

    loadPoseidon();
  }, []);

  if (state.isLoading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" />
          <Text>Initializing Poseidon hash function...</Text>
        </VStack>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          Failed to initialize Poseidon hash function. Please refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <PoseidonContext.Provider value={state.poseidon}>
      {children}
    </PoseidonContext.Provider>
  );
}

export function usePoseidon() {
  const poseidon = useContext(PoseidonContext);
  if (poseidon === null) {
    throw new Error('usePoseidon must be used within a PoseidonProvider');
  }
  return poseidon;
} 