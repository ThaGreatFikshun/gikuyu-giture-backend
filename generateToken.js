const crypto = require('crypto');

function generateToken(apiKey, merchantCode, consumerSecret) {
    // Get the current timestamp (in seconds)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Generate a unique nonce (random value)
    const nonce = crypto.randomBytes(16).toString('hex');
    // Generate the HMAC SHA256 signature with the consumer secret
    const signature = crypto.createHmac('sha256', consumerSecret)
        .update(apiKey + merchantCode + timestamp + nonce) // Concatenate the data to be signed
        .digest('base64'); // Base64 encode the signature

    // Return the token in the specified format (API_KEY:timestamp:nonce:signature)
    return Buffer.from(`${apiKey}:${timestamp}:${nonce}:${signature}`).toString('base64');
}

const API_KEY = "42wsnQg3Z6FVudcvwI6HMPM/BW8tWSy8JllAr7AlhKMkoiKq4HMfOtQ3zhoSzucpo/9vhl6hFfkrkNtxZoN1+Q==";
const MERCHANT_CODE = "5685692761";
const CONSUMER_SECRET = "252eCtIt6Lw9fhI1X8f9h90NIGPlGo";

// Generate the token
const token = generateToken(API_KEY, MERCHANT_CODE, CONSUMER_SECRET);
console.log("Generated Token:", token);
