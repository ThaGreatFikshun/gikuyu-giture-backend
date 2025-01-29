const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths for saving keys
const PRIVATE_KEY_PATH = path.resolve(__dirname, 'private_key.pem');
const PUBLIC_KEY_PATH = path.resolve(__dirname, 'public_key.pem');

// Function to generate RSA key pair
const generateKeyPair = () => {
    try {
        // Generate RSA key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Key size in bits
            publicKeyEncoding: {
                type: 'spki', // Recommended for public keys
                format: 'pem' // PEM format
            },
            privateKeyEncoding: {
                type: 'pkcs8', // Recommended for private keys
                format: 'pem' // PEM format
            }
        });

        // Save keys to files
        fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
        fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

        console.log('Keys generated successfully!');
        console.log(`Private Key Path: ${PRIVATE_KEY_PATH}`);
        console.log(`Public Key Path: ${PUBLIC_KEY_PATH}`);
    } catch (error) {
        console.error('Failed to generate keys:', error);
        throw new Error('Failed to generate keys');
    }
};

// Call the function to generate keys
generateKeyPair();
