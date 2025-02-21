const fs = require('fs');
const path = require('path');

async function convertVerificationKey() {
    try {
        // Read the original verification key
        const vkPath = path.join(__dirname, '../circuit/verification_key.json');
        console.log('Reading verification key from:', vkPath);
        const vk = JSON.parse(fs.readFileSync(vkPath, 'utf8'));
        console.log('Original verification key loaded');

        // Convert the entire verification key to base64
        const vkBase64 = Buffer.from(JSON.stringify(vk)).toString('base64');

        // Create the new format
        const newVk = {
            protocol: "groth16",
            curve: "bn128",
            nPublic: vk.nPublic || 2,  // Default to 2 if not specified
            vk_base64: vkBase64
        };

        // Update the relayer's verification key in the correct location
        const relayerPath = path.join(__dirname, '../relayer/verification_key/verification_key.json');
        console.log('Writing to:', relayerPath);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(relayerPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(relayerPath, JSON.stringify(newVk, null, 2));
        console.log('✓ Verification key converted and saved to relayer at:', relayerPath);
    } catch (error) {
        console.error('Error during conversion:', error);
        process.exit(1);
    }
}

convertVerificationKey().catch(error => {
    console.error('Top level error:', error);
    process.exit(1);
}); 