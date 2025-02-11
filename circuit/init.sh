#!/bin/bash
set -e

# Create required directories
mkdir -p build/circuits
mkdir -p ../src/verification_key

# Create a dummy verification key for now
echo '[1,2,3,4]' > ../src/verification_key/verification_key.bin 