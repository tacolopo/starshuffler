export const config = {
  DEPOSIT_AMOUNT: {
    amount: "1000000", // 1 JUNO
    denom: "ujuno"
  },
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  CHAIN_CONFIG: {
    chainId: "juno-1",
    chainName: "Juno",
    rpcEndpoint: "https://rpc-juno.itastakers.com:443/",
    gasPrice: {
      amount: "0.025",
      denom: "ujuno"
    }
  }
}; 