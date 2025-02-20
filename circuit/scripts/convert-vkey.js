const fs = require('fs');

// Read command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error('Usage: node convert-vkey.js <input.json> <output.bin>');
    process.exit(1);
}

// Read the JSON verification key
const vkeyJson = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Ensure it's a Groth16 verification key
if (vkeyJson.protocol !== "groth16") {
    console.error('Invalid verification key format: not a Groth16 key');
    process.exit(1);
}

// Convert to binary format expected by ark-groth16
const binaryVkey = Buffer.from(JSON.stringify(vkeyJson));

// Create output directory if it doesn't exist
const outputDir = outputFile.substring(0, outputFile.lastIndexOf('/'));
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write the binary file
fs.writeFileSync(outputFile, binaryVkey);
console.log(`Converted verification key written to ${outputFile}`); 