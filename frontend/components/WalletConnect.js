import { useState } from 'react';
import { Button, Text, useToast } from '@chakra-ui/react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
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

      // Request connection to Juno testnet
      await window.keplr.enable(config.CHAIN_CONFIG.chainId);
      
      const offlineSigner = window.keplr.getOfflineSigner(config.CHAIN_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      
      // Create signing client
      const client = await SigningCosmWasmClient.connectWithSigner(
        config.CHAIN_CONFIG.rpcEndpoint,
        offlineSigner
      );

      onConnect({ client, address: accounts[0].address });
      
      toast({
        title: "Connected!",
        description: "Your wallet has been connected successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
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