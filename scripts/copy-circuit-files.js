const fs = require('fs');
const path = require('path');

function copyCircuitFiles() {
    try {
        // Create relayer directories if they don't exist
        const relayerCircuitsDir = path.join(__dirname, '../relayer/build/circuits');
        if (!fs.existsSync(relayerCircuitsDir)) {
            fs.mkdirSync(relayerCircuitsDir, { recursive: true });
        }

        // Copy mixer.zkey
        const zkeySource = path.join(__dirname, '../circuit/build/circuits/mixer_final.zkey');
        const zkeyDest = path.join(relayerCircuitsDir, 'mixer.zkey');
        fs.copyFileSync(zkeySource, zkeyDest);
        console.log('✓ Copied mixer.zkey');

        // Copy mixer.wasm
        const wasmSource = path.join(__dirname, '../circuit/build/circuits/mixer_js/mixer.wasm');
        const wasmDest = path.join(relayerCircuitsDir, 'mixer.wasm');
        fs.copyFileSync(wasmSource, wasmDest);
        console.log('✓ Copied mixer.wasm');

    } catch (error) {
        console.error('Error copying circuit files:', error);
        process.exit(1);
    }
}

copyCircuitFiles(); 