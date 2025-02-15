import { useState } from 'react';
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
import { utils } from 'circomlib';

const Deposit = ({ client, contractAddress }) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [secret, setSecret] = useState('');
  const toast = useToast();

  const generateRandomSecret = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const secret = Buffer.from(randomBytes).toString('hex');
    setSecret(secret);
  };

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);

      if (!secret) {
        throw new Error('Please generate a secret first');
      }

      // Generate commitment using the secret
      const commitment = utils.pedersenHash(
        Buffer.from(secret, 'hex')
      ).toString('hex');

      // Execute deposit transaction
      const result = await client.execute(
        contractAddress,
        {
          deposit: {
            commitment: commitment,
          },
        },
        "auto"
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

        <Button
          colorScheme="blue"
          onClick={generateRandomSecret}
          isDisabled={isDepositing}
        >
          Generate Random Secret
        </Button>

        <Button
          colorScheme="green"
          onClick={handleDeposit}
          isLoading={isDepositing}
          loadingText="Depositing..."
          isDisabled={!secret}
        >
          Deposit
        </Button>
      </VStack>
    </Box>
  );
};

export default Deposit; 