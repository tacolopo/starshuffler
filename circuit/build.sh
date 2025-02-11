#!/bin/bash
set -e

# Convert verification key to binary format for the contract
cd build/circuits
node -e "const fs = require('fs'); const vk = require('./verification_key.json'); fs.writeFileSync('./verification_key.bin', Buffer.from(JSON.stringify(vk)))" 