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
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { generateProof } from '../../utils/zkProof';
import { config } from '../../config';
import { usePoseidon } from '../PoseidonProvider';

const Withdraw = ({ client, contractAddress }) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const poseidon = usePoseidon();
  const toast = useToast();

  // Load deposits from localStorage when component mounts
  useEffect(() => {
    try {
      const storedDeposits = JSON.parse(localStorage.getItem('deposits') || '[]');
      console.log('Loaded deposits:', storedDeposits);
      setDeposits(storedDeposits);
    } catch (error) {
      console.error('Error loading deposits:', error);
      toast({
        title: 'Error Loading Deposits',
        description: 'Failed to load your previous deposits',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);

      if (!client) {
        throw new Error('Wallet is not connected');
      }

      if (!selectedDeposit || !recipientAddress) {
        throw new Error('Please select a deposit and enter recipient address');
      }

      const deposit = deposits.find(d => d.secret === selectedDeposit);
      if (!deposit) {
        throw new Error('Selected deposit not found');
      }

      // Get the connected wallet's address for the fee payer
      const [account] = await client.signer.getAccounts();
      if (!account) {
        throw new Error('No account found. Please check your wallet connection');
      }
      
      // Get the current root
      const rootResponse = await client.queryContractSmart(contractAddress, {
        get_merkle_root: {}
      });
      console.log('Current root:', rootResponse);

      // Generate nullifier hash using poseidon
      const secretBigInt = BigInt('0x' + deposit.secret);
      const nullifierHash = poseidon.F.toString(poseidon([secretBigInt]));

      // Generate ZK proof
      const proof = await generateProof(
        deposit.secret,
        deposit.commitment,
        [deposit.commitment], // Just use our commitment for now
        recipientAddress
      );

      // Prepare the withdrawal message
      const msg = {
        withdraw: {
          proof: proof,
          root: rootResponse.root, // Use the root from contract response
          nullifier_hash: nullifierHash,
          recipient: recipientAddress,
        },
      };

      console.log('Withdrawal message:', msg);

      const fee = {
        amount: [{
          denom: config.CHAIN_CONFIG.gasPrice.denom,
          amount: "500000", // 0.5 JUNO for gas
        }],
        gas: "300000",
      };

      // Execute withdrawal transaction
      const result = await client.execute(
        account.address,
        contractAddress,
        msg,
        fee,
        "Withdraw from privacy mixer"
      );

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
      console.error('Withdrawal error:', error);
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

  if (!client) {
    return (
      <Box p={6} borderWidth={1} borderRadius="lg">
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to make a withdrawal
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Withdraw Funds
        </Text>

        {deposits.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No deposits found. Make a deposit first to enable withdrawals.
          </Alert>
        ) : (
          <>
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
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Withdraw; 