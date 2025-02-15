import { useState } from 'react';
import { Button, Text, useToast } from '@chakra-ui/react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

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
      await window.keplr.enable("uni-5");
      
      const offlineSigner = window.keplr.getOfflineSigner("uni-5");
      const accounts = await offlineSigner.getAccounts();
      
      // Create signing client
      const client = await SigningCosmWasmClient.connectWithSigner(
        "https://rpc.uni.juno.deuslabs.fi",
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