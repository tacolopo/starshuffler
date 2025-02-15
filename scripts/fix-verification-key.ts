import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

function fixVerificationKey() {
    const verificationKeyPath = path.join(__dirname, '../src/verification_key/verification_key.json');
    
    if (!existsSync(verificationKeyPath)) {
        console.error('Verification key not found. Please run setup-circuit first.');
        process.exit(1);
    }

    try {
        // Read the current content
        const content = readFileSync(verificationKeyPath, 'utf8');
        
        // Try to parse it as JSON first
        let verificationKey;
        try {
            verificationKey = JSON.parse(content);
        } catch {
            // If it's not JSON, it might be a binary string
            verificationKey = JSON.parse(Buffer.from(content).toString());
        }

        // Ensure it has the correct format
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

        // Write it back as formatted JSON
        writeFileSync(verificationKeyPath, JSON.stringify(formattedKey, null, 2));
        console.log('Verification key fixed successfully!');
    } catch (error) {
        console.error('Failed to fix verification key:', error);
        process.exit(1);
    }
}

fixVerificationKey(); 