import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import WalletConnect from '../components/WalletConnect';
import Deposit from '../components/mixer/Deposit';
import Withdraw from '../components/mixer/Withdraw';
import { config } from '../config';

export default function Home() {
  const [walletData, setWalletData] = useState(null);

  const handleConnect = (data) => {
    setWalletData(data);
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading mb={4}>Privacy Mixer</Heading>
          <Text mb={8}>A secure way to maintain transaction privacy on the blockchain</Text>
          
          {!walletData && <WalletConnect onConnect={handleConnect} />}
          
          {walletData && (
            <Text mb={4}>
              Connected: {walletData.address.slice(0, 8)}...{walletData.address.slice(-8)}
            </Text>
          )}
        </Box>

        {walletData && (
          <Tabs isFitted variant="enclosed" width="100%">
            <TabList mb="1em">
              <Tab>Deposit</Tab>
              <Tab>Withdraw</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Deposit
                  client={walletData.client}
                  contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
                />
              </TabPanel>
              <TabPanel>
                <Withdraw
                  client={walletData.client}
                  contractAddress={config.CONTRACT_ADDRESS}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </VStack>
    </Container>
  );
} 