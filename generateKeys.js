const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Function to generate the RSA key pair
const generateKeyPair = () => {
    try {
        // Generate RSA key pair with a modulus length of 2048 bits
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Key size in bits (2048 is a common size)
            publicKeyEncoding: {
                type: 'spki',  // Standard format for public keys
                format: 'pem', // PEM format (Base64 encoded)
            },
            privateKeyEncoding: {
                type: 'pkcs8', // Standard format for private keys
                format: 'pem', // PEM format (Base64 encoded)
            },
        });

        // Define the file paths where the keys will be saved
        const privateKeyPath = path.join(__dirname, 'private_key.pem');
        const publicKeyPath = path.join(__dirname, 'public_key.pem');

        // Save the keys to files
        fs.writeFileSync(privateKeyPath, privateKey);
        fs.writeFileSync(publicKeyPath, publicKey);

        console.log('Keys generated successfully!');
        console.log(`Private Key Path: ${privateKeyPath}`);
        console.log(`Public Key Path: ${publicKeyPath}`);

    } catch (error) {
        console.error('Failed to generate keys:', error);
    }
};

// Generate the key pair
generateKeyPair();
