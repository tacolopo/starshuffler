import { execSync } from 'child_process';
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

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
        
        // Use the full verification key format
        const formattedKey = {
            protocol: "groth16",
            curve: "bn128",
            nPublic: verificationKey.nPublic,
            vk_alpha_1: verificationKey.vk_alpha_1,
            vk_beta_2: verificationKey.vk_beta_2,
            vk_gamma_2: verificationKey.vk_gamma_2,
            vk_delta_2: verificationKey.vk_delta_2,
            vk_alphabeta_12: verificationKey.vk_alphabeta_12,
            IC: verificationKey.IC
        };

        // Save both formats
        writeFileSync(
            'verification_key.json',
            JSON.stringify(formattedKey, null, 2)  // Pretty print JSON
        );

        // Copy to both locations where the contract might look for it
        const contractKeyPath = path.join(__dirname, '../src/verification_key');
        const buildKeyPath = path.join(__dirname, 'build/circuits');
        mkdirSync(contractKeyPath, { recursive: true });
        
        writeFileSync(
            path.join(contractKeyPath, 'verification_key.json'),
            JSON.stringify(formattedKey, null, 2)  // Pretty print JSON
        );
        
        writeFileSync(
            path.join(buildKeyPath, 'verification_key.json'),
            JSON.stringify(formattedKey, null, 2)  // Pretty print JSON
        );

        console.log("Setup complete!");
        
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

setupCircuit().catch(console.error); 