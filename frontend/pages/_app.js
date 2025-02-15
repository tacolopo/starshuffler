import { ChakraProvider } from '@chakra-ui/react'
import { PoseidonProvider } from '../components/PoseidonProvider'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <PoseidonProvider>
        <Component {...pageProps} />
      </PoseidonProvider>
    </ChakraProvider>
  )
}

export default MyApp 