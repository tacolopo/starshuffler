const { execSync } = require('child_process');
const { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

// Helper to convert decimal string to 32-byte buffer in big-endian format
const decimalToBufferBE = (decimal: string) => {
    const bytes = [];
    let num = BigInt(decimal);
    for (let i = 0; i < 32; i++) {
        bytes.unshift(Number(num & BigInt(255))); // Push to front for BE
        num = num >> BigInt(8);
    }
    return Buffer.from(bytes);
};

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
            execSync('npm install circomlib snarkjs ts-node typescript @types/node', { stdio: 'inherit' });
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

        // Read the verification key JSON
        const verificationKey = JSON.parse(readFileSync('verification_key.json', 'utf8'));
        
        // Create binary format that matches ark-groth16's format for BN254
        let binaryKey = Buffer.alloc(0);

        // Convert decimal string to little-endian bytes in Montgomery form
        function toMontgomeryLE(decimal: string): Buffer {
            const bigIntVal = BigInt(decimal);
            // BN254 modulus
            const BN254_MODULUS = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
            // R^2 mod p for Montgomery conversion
            const R2 = BigInt("3096616502983709201646626462971078013424005175480574684277844722172171871975");
            // Convert to Montgomery form: (x * R^2) mod p
            const montValue = (bigIntVal * R2) % BN254_MODULUS;
            
            // Convert to 32-byte little-endian
            const buffer = Buffer.alloc(32);
            let n = montValue;
            for (let i = 0; i < 32; i++) {
                buffer[i] = Number(n & BigInt(0xff));
                n = n >> BigInt(8);
            }
            return buffer;
        }

        // Write alpha_g1 (x, y) coordinates in Montgomery form
        binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_alpha_1[0])]);
        binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_alpha_1[1])]);

        // Write beta_g2 coordinates in Montgomery form
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_beta_2[0][i])]);
        }
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_beta_2[1][i])]);
        }

        // Write gamma_g2 coordinates in Montgomery form
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_gamma_2[0][i])]);
        }
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_gamma_2[1][i])]);
        }

        // Write delta_g2 coordinates in Montgomery form
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_delta_2[0][i])]);
        }
        for (let i = 0; i < 2; i++) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(verificationKey.vk_delta_2[1][i])]);
        }

        // Write gamma_abc_g1 vector length as 8-byte little-endian
        const vecLenBuf = Buffer.alloc(8);
        vecLenBuf.writeBigUInt64LE(BigInt(verificationKey.IC.length));
        binaryKey = Buffer.concat([binaryKey, vecLenBuf]);

        // Write IC points (gamma_abc_g1) in Montgomery form
        for (const point of verificationKey.IC) {
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(point[0])]);
            binaryKey = Buffer.concat([binaryKey, toMontgomeryLE(point[1])]);
        }

        // Verify the binary key length
        const expectedLength = 
            (2 * 32) +         // alpha_g1 (x,y)
            (4 * 32) +         // beta_g2 (x_c1,x_c0,y_c1,y_c0)
            (4 * 32) +         // gamma_g2
            (4 * 32) +         // delta_g2
            8 +                // gamma_abc_g1 vector length (uint64)
            (verificationKey.IC.length * 2 * 32); // IC points (x,y each)

        if (binaryKey.length !== expectedLength) {
            throw new Error(`Invalid verification key length. Expected ${expectedLength} bytes, got ${binaryKey.length} bytes`);
        }

        // Print debug info
        console.log("\nVerification key structure:");
        console.log(`alpha_g1: ${verificationKey.vk_alpha_1.slice(0, 2).join(', ')}`);
        console.log(`beta_g2: ${verificationKey.vk_beta_2.map(p => p.slice(0, 2).join(', ')).join(' | ')}`);
        console.log(`gamma_g2: ${verificationKey.vk_gamma_2.map(p => p.slice(0, 2).join(', ')).join(' | ')}`);
        console.log(`delta_g2: ${verificationKey.vk_delta_2.map(p => p.slice(0, 2).join(', ')).join(' | ')}`);
        console.log(`IC length: ${verificationKey.IC.length}`);
        console.log(`First IC point: ${verificationKey.IC[0].slice(0, 2).join(', ')}`);

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

        console.log(`✓ Verification key files generated in src/verification_key/`);
        console.log(`  Binary key size: ${binaryKey.length} bytes`);
        console.log(`  Number of IC points: ${verificationKey.IC.length}`);
        
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

setupCircuit().catch(console.error); 