import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  useToast,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { config } from '../../config';

const Deposit = ({ client, contractAddress }) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [secret, setSecret] = useState('');
  const [poseidon, setPoseidon] = useState(null);
  const toast = useToast();

  // Initialize poseidon
  useEffect(() => {
    const initPoseidon = async () => {
      if (typeof window !== 'undefined') {
        const { buildPoseidon } = await import('circomlibjs');
        const poseidonInstance = await buildPoseidon();
        setPoseidon(poseidonInstance);
      }
    };
    initPoseidon();
  }, []);

  const generateRandomSecret = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const secret = Buffer.from(randomBytes).toString('hex');
    setSecret(secret);
  };

  const handleDeposit = async () => {
    try {
      if (!poseidon) {
        throw new Error('Poseidon hash function not initialized');
      }

      setIsDepositing(true);

      if (!secret) {
        throw new Error('Please generate a secret first');
      }

      // Convert secret to bigInt and calculate commitment
      const secretBigInt = BigInt('0x' + secret);
      const hash = poseidon.F.toString(poseidon([secretBigInt]));
      const commitment = hash.toString();

      console.log('Secret:', secret);
      console.log('Commitment:', commitment);

      // Execute deposit transaction
      const result = await client.execute(
        contractAddress,
        {
          deposit: {
            commitment: commitment,
          },
        },
        "auto",
        undefined,
        [config.DEPOSIT_AMOUNT]
      );

      toast({
        title: 'Deposit Successful!',
        description: `Transaction hash: ${result.transactionHash}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Save secret and commitment to local storage for withdrawal
      const depositData = {
        secret,
        commitment,
        timestamp: Date.now(),
      };
      const deposits = JSON.parse(localStorage.getItem('deposits') || '[]');
      deposits.push(depositData);
      localStorage.setItem('deposits', JSON.stringify(deposits));

    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: 'Deposit Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Deposit Funds
        </Text>
        
        <FormControl>
          <FormLabel>Secret</FormLabel>
          <Input
            value={secret}
            isReadOnly
            placeholder="Generate a random secret"
          />
        </FormControl>

        <Text fontSize="sm" color="gray.600">
          Deposit amount: {parseInt(config.DEPOSIT_AMOUNT.amount) / 1000000} {config.DEPOSIT_AMOUNT.denom.replace('u', '').toUpperCase()}
        </Text>

        <Button
          colorScheme="blue"
          onClick={generateRandomSecret}
          isDisabled={isDepositing || !poseidon}
        >
          Generate Random Secret
        </Button>

        <Button
          colorScheme="green"
          onClick={handleDeposit}
          isLoading={isDepositing}
          loadingText="Depositing..."
          isDisabled={!secret || !poseidon}
        >
          Deposit
        </Button>
      </VStack>
    </Box>
  );
};

export default Deposit; 