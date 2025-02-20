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
        const ptauPath = path.join(__dirname, 'build/circuits/pot16_final.ptau');
        
        console.log("Cleaning up previous build...");
        // Save ptau file if it exists
        let ptauExists = false;
        let ptauBuffer: Buffer | null = null;
        if (existsSync(ptauPath)) {
            console.log("Preserving existing powers of tau file...");
            ptauExists = true;
            ptauBuffer = readFileSync(ptauPath);
        }
        
        // Clean build directory except for ptau
        rmSync('build', { recursive: true, force: true });

        console.log("Creating build directories...");
        mkdirSync(path.join(__dirname, 'build/circuits'), { recursive: true });
        mkdirSync(path.join(__dirname, 'build/contract'), { recursive: true });
        mkdirSync(path.join(__dirname, 'circuits'), { recursive: true });

        // Restore ptau file if it existed
        if (ptauExists && ptauBuffer) {
            console.log("Restoring powers of tau file...");
            writeFileSync(ptauPath, ptauBuffer);
        }

        // Don't reinstall dependencies if they exist
        if (!existsSync('node_modules')) {
            console.log("Installing dependencies...");
            execSync('npm install circomlib snarkjs ts-node typescript @types/node', { stdio: 'inherit' });
        }

        console.log("Compiling circuit...");
        execSync('circom circuits/merkleproof.circom --r1cs --wasm --sym -l node_modules -o build/circuits', {
            stdio: 'inherit'
        });

        if (!existsSync(ptauPath)) {
            console.log("Downloading powers of tau...");
            const ptauUrl = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau";
            execSync(`curl -L ${ptauUrl} -o ${ptauPath}`, {
                stdio: 'inherit'
            });
        } else {
            console.log("Using existing powers of tau file...");
        }

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
        
        // Debug: Print verification key structure
        console.log("Verification Key Structure:", JSON.stringify(verificationKey, null, 2));
        
        // CORRECTED Montgomery parameters
        const BN254_MODULUS = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
        const MONTGOMERY_R = BigInt("6350873247222562777331618895613943882140414003940917325363185418647755041422"); // 2^256 mod p

        // Validate verification key structure with alternative field names
        const alpha1 = verificationKey.vk_alpha_1 || verificationKey.alpha_1 || verificationKey.alpha1;
        const beta2 = verificationKey.vk_beta_2 || verificationKey.beta_2 || verificationKey.beta2;
        const gamma2 = verificationKey.vk_gamma_2 || verificationKey.gamma_2 || verificationKey.gamma2;
        const delta2 = verificationKey.vk_delta_2 || verificationKey.delta_2 || verificationKey.delta2;
        const ic = verificationKey.IC || verificationKey.ic;

        console.log("\nRaw verification key points:");
        console.log("alpha1:", JSON.stringify(alpha1, null, 2));
        console.log("beta2:", JSON.stringify(beta2, null, 2));
        console.log("gamma2:", JSON.stringify(gamma2, null, 2));
        console.log("delta2:", JSON.stringify(delta2, null, 2));

        // Helper to clean up number strings that might contain whitespace or duplicates
        const cleanNumber = (str: string | number | undefined): string => {
            if (str === undefined) {
                console.error("Received undefined value in cleanNumber");
                throw new Error("Cannot clean undefined number");
            }
            const strValue = str.toString();
            // Remove all whitespace and handle potential duplicates
            const parts = strValue.split('"').filter(s => s.trim().length > 0);
            if (parts.length === 0) {
                console.error("No valid parts found in string:", strValue);
                throw new Error("No valid number found in string");
            }
            return parts[parts.length - 1].replace(/\s+/g, '');
        };

        // Helper for modular inverse
        const modularInverse = (a: bigint, m: bigint): bigint => {
            let [old_r, r] = [a, m];
            let [old_s, s] = [BigInt(1), BigInt(0)];
            
            while (r !== BigInt(0)) {
                const quotient = old_r / r;
                [old_r, r] = [r, old_r - quotient * r];
                [old_s, s] = [s, old_s - quotient * s];
            }
            
            return (old_s % m + m) % m;
        };

        // Helper to validate and extract G2 point coordinates
        const validateG2Point = (point: any, name: string): [string[], string[]] => {
            console.log(`\n=== Validating G2 point ${name} ===`);
            console.log("Raw point data:", JSON.stringify(point, null, 2));
            
            if (!Array.isArray(point) || point.length !== 3) {
                console.error(`Invalid G2 point ${name}: expected array of length 3, got length ${Array.isArray(point) ? point.length : 'not an array'}`);
                throw new Error(`Invalid G2 point ${name}: expected array of length 3`);
            }

            // G2 points should have structure [x_coords, y_coords, z_coords] where each is an array of 2 elements
            const x = point[0];
            const y = point[1];
            const z = point[2];

            console.log("Point coordinates:");
            console.log("x:", JSON.stringify(x, null, 2));
            console.log("y:", JSON.stringify(y, null, 2)); 
            console.log("z:", JSON.stringify(z, null, 2));

            if (!Array.isArray(x) || x.length !== 2 || !Array.isArray(y) || y.length !== 2) {
                console.error(`Invalid G2 point ${name} coordinate format:`, {
                    x: `${Array.isArray(x) ? x.length : 'not array'} elements`,
                    y: `${Array.isArray(y) ? y.length : 'not array'} elements`
                });
                throw new Error(`Invalid G2 point ${name}: x/y coordinates should be arrays of length 2`);
            }

            // Convert to affine coordinates
            if (z[0] !== "1" || z[1] !== "0") {
                console.log(`Note: G2 point ${name} not in standard projective form (z != [1,0]), converting...`);
            }

            // Clean and convert all coordinates
            try {
                console.log("Converting coordinates to BigInt...");
                const z0 = BigInt(cleanNumber(z[0]));
                const z1 = BigInt(cleanNumber(z[1]));
                console.log("z0:", z0.toString());
                console.log("z1:", z1.toString());
                
                // For BN254's G2 points, standard form has z=[1,0]
                // If we're already in standard form, no conversion needed
                if (z0 === BigInt(1) && z1 === BigInt(0)) {
                    console.log("Point already in standard form, no conversion needed");
                    const affineX = [cleanNumber(x[0]), cleanNumber(x[1])];
                    const affineY = [cleanNumber(y[0]), cleanNumber(y[1])];
                    
                    console.log("Final coordinates:");
                    console.log("affineX:", affineX);
                    console.log("affineY:", affineY);
                    console.log("=== G2 point validation complete ===\n");
                    
                    return [affineX, affineY];
                }
                
                // If not in standard form, convert using modular inverse
                console.log("Converting to standard form...");
                const zInv0 = modularInverse(z0, BN254_MODULUS);
                const zInv1 = modularInverse(z1, BN254_MODULUS);
                console.log("zInv0:", zInv0.toString());
                console.log("zInv1:", zInv1.toString());

                // Convert to standard form coordinates
                const affineX = [
                    (BigInt(cleanNumber(x[0])) * zInv0 % BN254_MODULUS).toString(),
                    (BigInt(cleanNumber(x[1])) * zInv1 % BN254_MODULUS).toString()
                ];
                const affineY = [
                    (BigInt(cleanNumber(y[0])) * zInv0 % BN254_MODULUS).toString(),
                    (BigInt(cleanNumber(y[1])) * zInv1 % BN254_MODULUS).toString()
                ];
                
                console.log("Final coordinates:");
                console.log("affineX:", affineX);
                console.log("affineY:", affineY);
                console.log("=== G2 point validation complete ===\n");

                return [affineX, affineY];
            } catch (error) {
                console.error(`Error during coordinate conversion for ${name}:`, error);
                throw error;
            }
        };

        // Helper to convert from projective to affine coordinates for G1 points
        const toAffinePoint = (point: any) => {
            console.log("Converting G1 point:", JSON.stringify(point, null, 2));
            if (!Array.isArray(point) || point.length !== 3) {
                throw new Error("Invalid G1 point: expected array of length 3");
            }

            if (point[2] === undefined || point[2] === "0") {
                throw new Error("Point at infinity not supported");
            }
            
            // Convert z^-1 for affine coordinates
            const z = BigInt(cleanNumber(point[2]));
            const zInv = modularInverse(z, BN254_MODULUS);
            const x = (BigInt(cleanNumber(point[0])) * zInv) % BN254_MODULUS;
            const y = (BigInt(cleanNumber(point[1])) * zInv) % BN254_MODULUS;
            return [x.toString(), y.toString()];
        };

        // Convert points to affine coordinates
        console.log("\nConverting points to affine coordinates...");
        
        console.log("Converting alpha_g1...");
        const affineAlpha1 = toAffinePoint(alpha1);
        console.log("Affine alpha1:", affineAlpha1);

        console.log("\nConverting beta_g2...");
        const affineBeta2 = validateG2Point(beta2, "beta2");
        console.log("Affine beta2:", affineBeta2);

        console.log("\nConverting gamma_2...");
        const affineGamma2 = validateG2Point(gamma2, "gamma2");
        console.log("Affine gamma2:", affineGamma2);

        console.log("\nConverting delta_2...");
        const affineDelta2 = validateG2Point(delta2, "delta2");
        console.log("Affine delta2:", affineDelta2);

        console.log("\nConverting IC points...");
        const affineIC = ic.map((point, index) => {
            console.log(`Converting IC point ${index}...`);
            return toAffinePoint(point);
        });

        // Update references to use affine coordinates
        verificationKey.vk_alpha_1 = affineAlpha1;
        verificationKey.vk_beta_2 = affineBeta2;
        verificationKey.vk_gamma_2 = affineGamma2;
        verificationKey.vk_delta_2 = affineDelta2;
        verificationKey.IC = affineIC;

        // Create binary format that matches ark-groth16's format for BN254
        let binaryKey = Buffer.alloc(0);

        function toMontgomeryLE(decimal: string): Buffer {
            const bigIntVal = BigInt(cleanNumber(decimal));
            // CORRECTED: Multiply by R not R²
            const montValue = (bigIntVal * MONTGOMERY_R) % BN254_MODULUS;
            
            const buffer = Buffer.alloc(32);
            let n = montValue;
            for (let i = 0; i < 32; i++) {
                buffer[i] = Number(n & BigInt(0xff));
                n = n >> BigInt(8);
            }
            return buffer;
        }

        // CORRECTED G2 serialization order
        const serializeG2 = (point: any) => {
            console.log("Serializing G2 point:", JSON.stringify(point, null, 2));
            if (!Array.isArray(point) || point.length !== 2 || 
                !Array.isArray(point[0]) || point[0].length !== 2 ||
                !Array.isArray(point[1]) || point[1].length !== 2) {
                console.error("Invalid G2 point structure:", point);
                throw new Error("Invalid G2 point structure");
            }
            // Expected structure: [[x.c0, x.c1], [y.c0, y.c1]]
            // For compressed format, we only need x coordinates
            return Buffer.concat([
                toMontgomeryLE(point[0][0]), // x.c0: 32 bytes
                toMontgomeryLE(point[0][1])  // x.c1: 32 bytes
            ]);
        };

        // Create vector length buffer for gamma_abc_g1
        const vecLenBuf = Buffer.alloc(8);
        vecLenBuf.writeBigUInt64LE(BigInt(verificationKey.IC.length));

        // For compressed format, we only need x coordinates
        binaryKey = Buffer.concat([
            toMontgomeryLE(verificationKey.vk_alpha_1[0]), // alpha_g1.x
            serializeG2(verificationKey.vk_beta_2),        // beta_g2.x
            serializeG2(verificationKey.vk_gamma_2),       // gamma_g2.x
            serializeG2(verificationKey.vk_delta_2),       // delta_g2.x
            vecLenBuf,
            ...verificationKey.IC.map(point => toMontgomeryLE(point[0])) // Only x coordinates
        ]);

        // Verify the binary key length
        const expectedLength = 
            32 +                // alpha_g1.x
            (2 * 32) +         // beta_g2.x (c0,c1)
            (2 * 32) +         // gamma_g2.x (c0,c1)
            (2 * 32) +         // delta_g2.x (c0,c1)
            8 +                // gamma_abc_g1 vector length (uint64)
            (verificationKey.IC.length * 32); // IC points (x only)

        if (binaryKey.length !== expectedLength) {
            throw new Error(`Invalid verification key length. Expected ${expectedLength} bytes, got ${binaryKey.length} bytes`);
        }

        // Add to setup.ts
        console.log("First 32 bytes (alpha_g1.x):", binaryKey.slice(0, 32).toString('hex'));
        console.log("BetaG2 x.c0:", binaryKey.slice(32, 64).toString('hex')); 
        console.log("BetaG2 x.c1:", binaryKey.slice(64, 96).toString('hex'));

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