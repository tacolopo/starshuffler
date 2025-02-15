import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  useToast,
  Select,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { utils } from 'circomlib';
import { generateProof } from '../../utils/zkProof';
import { config } from '../../config';

const Withdraw = ({ client, contractAddress }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const toast = useToast();

  useEffect(() => {
    const storedDeposits = JSON.parse(localStorage.getItem('deposits') || '[]');
    setDeposits(storedDeposits);
  }, []);

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      if (!selectedDeposit || !recipientAddress) {
        throw new Error('Please select a deposit and enter recipient address');
      }

      const deposit = deposits.find(d => d.secret === selectedDeposit);
      
      // Generate nullifier hash
      const nullifierHash = utils.pedersenHash(
        Buffer.from(deposit.secret, 'hex')
      ).toString('hex');

      // Get current Merkle root from contract
      const { root } = await client.queryContractSmart(contractAddress, {
        get_merkle_root: {}
      });

      // Generate ZK proof
      const proof = await generateProof(
        deposit.secret,
        root,
        nullifierHash,
        recipientAddress
      );

      // Send withdrawal request to relayer
      const response = await fetch(`${config.RELAYER_URL}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof,
          root,
          nullifierHash,
          recipient: recipientAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to process withdrawal');
      }

      const result = await response.json();

      toast({
        title: 'Withdrawal Successful!',
        description: `Transaction hash: ${result.transactionHash}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Remove used deposit from storage
      const updatedDeposits = deposits.filter(d => d.secret !== selectedDeposit);
      localStorage.setItem('deposits', JSON.stringify(updatedDeposits));
      setDeposits(updatedDeposits);
      setSelectedDeposit('');
      setRecipientAddress('');

    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Withdraw Funds
        </Text>

        <FormControl>
          <FormLabel>Select Deposit</FormLabel>
          <Select
            value={selectedDeposit}
            onChange={(e) => setSelectedDeposit(e.target.value)}
            placeholder="Select a deposit"
          >
            {deposits.map((deposit, index) => (
              <option key={deposit.secret} value={deposit.secret}>
                Deposit {index + 1} - {new Date(deposit.timestamp).toLocaleString()}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Recipient Address</FormLabel>
          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient address"
          />
        </FormControl>

        <Button
          colorScheme="green"
          onClick={handleWithdraw}
          isLoading={isWithdrawing}
          loadingText="Withdrawing..."
          isDisabled={!selectedDeposit || !recipientAddress}
        >
          Withdraw
        </Button>
      </VStack>
    </Box>
  );
};

export default Withdraw; 