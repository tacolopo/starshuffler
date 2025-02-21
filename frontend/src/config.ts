export const config = {
    CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    DEPOSIT_AMOUNT: {
        denom: "ujuno",
        amount: "1000000"  // 1 JUNO
    },
    RPC_URL: "https://rpc-juno.itastakers.com:443",
    CHAIN_ID: "juno-1",
    GAS_PRICE: "0.09ujuno"
}; 