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
import { usePoseidon } from '../PoseidonProvider';

const Withdraw = ({ client, contractAddress }) => {
  const [secret, setSecret] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const poseidon = usePoseidon();
  const toast = useToast();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawSecret = e.target.result.trim();
          setSecret(rawSecret);
        } catch (error) {
          toast({
            title: 'Error reading file',
            description: 'Could not read the secret file',
            status: 'error',
            duration: 5000,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleWithdraw = async () => {
    if (!secret || !recipientAddress) return;

    try {
      setIsWithdrawing(true);
      
      // Generate nullifier hash from secret
      const secretBigInt = BigInt('0x' + secret);
      const nullifierHash = poseidon.F.toString(poseidon([secretBigInt]));

      // First, get the proof from the relayer
      const proofResponse = await fetch(`${process.env.NEXT_PUBLIC_RELAYER_URL}/relay-withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: {
            secret: secret,
            recipient: recipientAddress
          }
        })
      });

      if (!proofResponse.ok) {
        const error = await proofResponse.json();
        throw new Error(error.details || error.error || 'Failed to process withdrawal');
      }

      const result = await proofResponse.json();

      toast({
        title: 'Withdrawal successful',
        description: `Transaction hash: ${result.txHash}`,
        status: 'success',
        duration: 5000,
      });

      // Reset form
      setSecret('');
      setRecipientAddress('');
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Withdrawal failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Upload Secret File</FormLabel>
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            p={1}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Recipient Address</FormLabel>
          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="juno..."
          />
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleWithdraw}
          isLoading={isWithdrawing}
          loadingText="Withdrawing..."
          isDisabled={!secret || !recipientAddress}
        >
          Withdraw
        </Button>
      </VStack>
    </Box>
  );
};

export default Withdraw; 