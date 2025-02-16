#!/bin/bash
set -e

echo "Step 1: Setting up circuit..."
cd circuit
npm install
bash setup.sh
cd ..

echo "Step 2: Building contract..."
cargo build --release --target wasm32-unknown-unknown
mkdir -p artifacts
cp target/wasm32-unknown-unknown/release/juno_privacy_mixer.wasm artifacts/

echo "Step 3: Optimizing contract..."
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.6

echo "Step 4: Deploying contract..."
npm install
npm run deploy-contract

echo "Step 5: Setting up relayer..."
cd relayer
npm install
npm run build
cd ..

echo "Step 6: Setting up frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Deployment complete! Please check deploy-checklist.sh for final verification." 