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
  Alert,
  AlertIcon,
  HStack,
} from '@chakra-ui/react';
import { config } from '../../config';
import { usePoseidon } from '../PoseidonProvider';

const Deposit = ({ client, contractAddress }) => {
  const [isDepositing, setIsDepositing] = useState(false);
  const [secret, setSecret] = useState('');
  const poseidon = usePoseidon();
  const toast = useToast();

  const generateRandomSecret = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const secret = Buffer.from(randomBytes).toString('hex');
    setSecret(secret);
  };

  const downloadSecret = () => {
    if (!secret) return;
    
    const blob = new Blob([secret], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mixer-secret-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Secret Downloaded',
      description: 'Keep this file safe! You will need it to withdraw your funds.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);

      if (!client) {
        throw new Error('Wallet is not connected');
      }

      if (!secret) {
        throw new Error('Please generate a secret first');
      }

      // Get the connected wallet's address
      const [account] = await client.signer.getAccounts();
      if (!account) {
        throw new Error('No account found. Please check your wallet connection');
      }

      // Convert secret to bigInt and calculate commitment
      const secretBigInt = BigInt('0x' + secret);
      const hash = poseidon.F.toString(poseidon([secretBigInt]));
      const commitment = hash.toString();

      console.log('Secret:', secret);
      console.log('Commitment:', commitment);
      console.log('Sender Address:', account.address);

      // Execute deposit transaction with correct parameter structure
      const msg = {
        deposit: {
          commitment: commitment,
        },
      };

      const fee = {
        amount: [{
          denom: config.DEPOSIT_AMOUNT.denom,
          amount: "500000", // 0.5 JUNO for gas
        }],
        gas: "200000",
      };

      const result = await client.execute(
        account.address,
        contractAddress,
        msg,
        fee,
        "Deposit to privacy mixer",
        [config.DEPOSIT_AMOUNT]
      );

      toast({
        title: 'Deposit Successful!',
        description: 'Please download your secret if you haven\'t already.',
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

  if (!client) {
    return (
      <Box p={6} borderWidth={1} borderRadius="lg">
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to make a deposit
        </Alert>
      </Box>
    );
  }

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

        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={generateRandomSecret}
            isDisabled={isDepositing}
            flex="1"
          >
            Generate Random Secret
          </Button>
          
          <Button
            colorScheme="teal"
            onClick={downloadSecret}
            isDisabled={!secret}
            flex="1"
          >
            Download Secret
          </Button>
        </HStack>

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