const { execSync } = require('child_process');
const { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

async function setupCircuit() {
    try {
        console.log("Cleaning up previous build...");
        rmSync('build', { recursive: true, force: true });
        // Don't delete package.json and node_modules since we need them
        // rmSync('node_modules', { recursive: true, force: true });
        // rmSync('package.json', { force: true });
        rmSync('package-lock.json', { force: true });

        console.log("Creating build directories...");
    mkdirSync(path.join(__dirname, 'build/circuits'), { recursive: true });
        mkdirSync(path.join(__dirname, 'build/contract'), { recursive: true });
        mkdirSync(path.join(__dirname, 'circuits'), { recursive: true });

        // Don't reinstall dependencies if they exist
        if (!existsSync('node_modules')) {
            console.log("Installing dependencies...");
            execSync('npm install circomlib snarkjs', { stdio: 'inherit' });
        }

        console.log("Compiling circuit...");
        execSync('circom circuits/merkleproof.circom --r1cs --wasm --sym -l node_modules -o build/circuits', {
            stdio: 'inherit'
        });

        console.log("Downloading powers of tau...");
        const ptauUrl = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau";
        execSync(`curl -L ${ptauUrl} -o build/circuits/pot16_final.ptau`, {
            stdio: 'inherit'
        });

        console.log("Generating proving key...");
        process.chdir('build/circuits');
        
        execSync('snarkjs groth16 setup merkleproof.r1cs pot16_final.ptau merkleproof_0.zkey', {
            stdio: 'inherit'
        });
        
        execSync('snarkjs zkey contribute merkleproof_0.zkey merkleproof_final.zkey --name="1st contribution" -v', {
            stdio: 'inherit'
        });
        
        execSync('snarkjs zkey export verificationkey merkleproof_final.zkey verification_key.json', {
            stdio: 'inherit'
        });

        console.log("Converting verification key to binary format...");
        const verificationKey = JSON.parse(readFileSync('verification_key.json', 'utf8'));
        
        // Create binary format
        let binaryKey = Buffer.alloc(0);

        // Helper to convert decimal string to 32-byte buffer
        const decimalToBuffer = (decimal: string) => {
            const hex = BigInt(decimal).toString(16).padStart(64, '0');
            return Buffer.from(hex, 'hex');
        };

        // Add alpha_g1
        for (const coord of verificationKey.vk_alpha_1) {
            binaryKey = Buffer.concat([binaryKey, decimalToBuffer(coord)]);
        }

        // Add beta_g2
        for (const point of verificationKey.vk_beta_2) {
            for (const coord of point) {
                binaryKey = Buffer.concat([binaryKey, decimalToBuffer(coord)]);
            }
        }

        // Add gamma_g2
        for (const point of verificationKey.vk_gamma_2) {
            for (const coord of point) {
                binaryKey = Buffer.concat([binaryKey, decimalToBuffer(coord)]);
            }
        }

        // Add delta_g2
        for (const point of verificationKey.vk_delta_2) {
            for (const coord of point) {
                binaryKey = Buffer.concat([binaryKey, decimalToBuffer(coord)]);
            }
        }

        // Add IC (encoded length followed by points)
        const icLength = Buffer.alloc(4);
        icLength.writeUInt32BE(verificationKey.IC.length);
        binaryKey = Buffer.concat([binaryKey, icLength]);
        
        for (const point of verificationKey.IC) {
            for (const coord of point) {
                binaryKey = Buffer.concat([binaryKey, decimalToBuffer(coord)]);
            }
        }

        // Create src/verification_key directory if it doesn't exist
        const contractKeyPath = path.join(__dirname, '../src/verification_key');
        mkdirSync(contractKeyPath, { recursive: true });
        
        // Save both formats
        writeFileSync(
            path.join(contractKeyPath, 'verification_key.json'),
            JSON.stringify(verificationKey, null, 2)
        );
        writeFileSync(
            path.join(contractKeyPath, 'verification_key.bin'),
            binaryKey
        );

        console.log("✓ Verification key files generated in src/verification_key/");
        
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

setupCircuit().catch(console.error); 