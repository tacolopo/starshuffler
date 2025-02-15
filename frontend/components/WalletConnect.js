import { useState } from 'react';
import { Button, Text, useToast } from '@chakra-ui/react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { config } from '../config';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  const connectKeplr = async () => {
    try {
      setIsConnecting(true);
      
      // Check if Keplr is installed
      if (!window.keplr) {
        throw new Error("Please install Keplr extension");
      }

      // Enable Keplr for the chain
      await window.keplr.enable(config.CHAIN_CONFIG.chainId);
      
      // Get the offlineSigner for this chainId
      const offlineSigner = await window.keplr.getOfflineSignerAuto(config.CHAIN_CONFIG.chainId);
      
      // Get the user's account
      const accounts = await offlineSigner.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Create signing client with the offlineSigner
      const client = await SigningCosmWasmClient.connectWithSigner(
        config.CHAIN_CONFIG.rpcEndpoint,
        offlineSigner,
        { gasPrice: config.CHAIN_CONFIG.gasPrice }
      );

      // Verify we can get accounts from the signer
      const signerAccounts = await offlineSigner.getAccounts();
      if (!signerAccounts || signerAccounts.length === 0) {
        throw new Error("Failed to get accounts from signer");
      }

      onConnect({ 
        client, 
        address: accounts[0].address,
        signer: offlineSigner 
      });
      
      toast({
        title: "Connected!",
        description: `Connected to ${accounts[0].address.slice(0, 8)}...${accounts[0].address.slice(-8)}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      colorScheme="teal"
      onClick={connectKeplr}
      isLoading={isConnecting}
      loadingText="Connecting..."
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnect; 