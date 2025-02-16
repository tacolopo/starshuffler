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
        
        // Export verification key in JSON format
        execSync('snarkjs zkey export verificationkey merkleproof_final.zkey verification_key.json', {
            stdio: 'inherit'
        });

        // Create src/verification_key directory if it doesn't exist
        const contractKeyPath = path.join(__dirname, '../src/verification_key');
        mkdirSync(contractKeyPath, { recursive: true });
        
        // Read the verification key JSON
        const verificationKey = JSON.parse(readFileSync('verification_key.json', 'utf8'));
        
        // Create binary format that matches arkworks' compressed format for BN254
        let binaryKey = Buffer.alloc(0);

        // Helper to convert decimal string to 32-byte buffer in little-endian
        const decimalToBuffer = (decimal: string) => {
            const bytes = [];
            let num = BigInt(decimal);
            for (let i = 0; i < 32; i++) {
                bytes.push(Number(num & BigInt(255)));
                num = num >> BigInt(8);
            }
            return Buffer.from(bytes);
        };

        // Write γₐᵦₖ (gamma_abc) vector - 2 G1 points for constant term and one public input
        // Each G1 point is compressed to 32 bytes
        for (const point of verificationKey.IC) {
            binaryKey = Buffer.concat([binaryKey, decimalToBuffer(point[0])]);
        }

        // Write α in G1 (compressed to 32 bytes)
        binaryKey = Buffer.concat([binaryKey, decimalToBuffer(verificationKey.vk_alpha_1[0])]);

        // Write β in G2 (compressed to 64 bytes)
        binaryKey = Buffer.concat([
            binaryKey,
            decimalToBuffer(verificationKey.vk_beta_2[0][0]),
            decimalToBuffer(verificationKey.vk_beta_2[0][1])
        ]);

        // Write prepared (negated) γ in G2 (compressed to 64 bytes)
        binaryKey = Buffer.concat([
            binaryKey,
            decimalToBuffer(verificationKey.vk_gamma_2[0][0]),
            decimalToBuffer(verificationKey.vk_gamma_2[0][1])
        ]);

        // Write prepared (negated) δ in G2 (compressed to 64 bytes)
        binaryKey = Buffer.concat([
            binaryKey,
            decimalToBuffer(verificationKey.vk_delta_2[0][0]),
            decimalToBuffer(verificationKey.vk_delta_2[0][1])
        ]);
        
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