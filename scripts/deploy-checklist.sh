#!/bin/bash

# Check environment variables
echo "Checking environment variables..."
required_vars=(
    "RPC_URL"
    "CONTRACT_ADDRESS"
    "RELAYER_MNEMONIC"
    "REDIS_URL"
    "SENTRY_DSN"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
done

# Check contract deployment
echo "Checking contract deployment..."
curl -X POST $RPC_URL -d '{"jsonrpc":"2.0","id":1,"method":"abci_query","params":{"path":"/cosmwasm.wasm.v1.Query/ContractInfo","data":"'$(echo -n '{"address":"'$CONTRACT_ADDRESS'"}' | base64)'"}}'

# Check Redis connection
echo "Checking Redis connection..."
redis-cli -u $REDIS_URL ping

# Check frontend build
echo "Checking frontend build..."
cd frontend && npm run build

# Check relayer build
echo "Checking relayer build..."
cd ../relayer && npm run build

echo "All checks passed!" 