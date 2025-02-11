export default {
    rpc: {
        url: process.env.RPC_URL!,
        timeout: 10000,
    },
    redis: {
        url: process.env.REDIS_URL!,
    },
    contract: {
        address: process.env.CONTRACT_ADDRESS!,
    },
    sentry: {
        dsn: process.env.SENTRY_DSN,
    },
    relayer: {
        mnemonic: process.env.RELAYER_MNEMONIC!,
        gasPrice: process.env.GAS_PRICE || '0.025ujuno',
    },
    rateLimit: {
        window: 15 * 60 * 1000, // 15 minutes
        max: 5,
    },
} 