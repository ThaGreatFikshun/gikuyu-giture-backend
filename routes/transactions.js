// const express = require('express');
// const Transaction = require('../models/Transaction');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// const router = express.Router();

// // Environment variables
// const {
//     API_KEY,
//     MERCHANT_CODE,
//     CONSUMER_SECRET,
//     JENGA_API_URL,
//     JWT_SECRET,
//     PRIVATE_KEY_PATH,
//     CALLBACK_URL,
// } = process.env;

// // Enhanced Signature Generation Function
// const generateSignature = (privateKeyPath, message) => {
//     try {
//         const resolvedKeyPath = path.resolve(privateKeyPath);
//         if (!fs.existsSync(resolvedKeyPath)) {
//             throw new Error(`Private key not found at ${resolvedKeyPath}`);
//         }

//         const privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');
//         const sign = crypto.createSign('RSA-SHA256');
//         sign.update(message, 'utf8'); // Ensure UTF-8 encoding
//         sign.end();
//         return sign.sign(privateKey, 'base64'); // Return base64 encoded signature
//     } catch (error) {
//         console.error('Signature Generation Error:', error);
//         throw new Error(`Failed to generate signature: ${error.message}`);
//     }
// };

// // Validation Middleware
// const validateFields = (requiredFields) => {
//     return (req, res, next) => {
//         const missingFields = requiredFields.filter(field => !req.body[field]);
//         if (missingFields.length > 0) {
//             return res.status(400).json({
//                 message: `Missing required fields: ${missingFields.join(', ')}`
//             });
//         }
//         next();
//     };
// };

// // Enhanced Token Authentication Middleware
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ 
//             message: 'No authentication token provided',
//             error: 'Unauthorized' 
//         });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
//         if (!decoded.id) {
//             return res.status(403).json({ 
//                 message: 'Invalid token structure',
//                 error: 'Forbidden' 
//             });
//         }

//         req.userId = decoded.id;
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error('Token Verification Error:', error);
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({ 
//                 message: 'Token expired',
//                 error: 'Please login again' 
//             });
//         }
//         return res.status(403).json({ 
//             message: 'Invalid token',
//             error: error.message 
//         });
//     }
// };

// // Get Bearer Token from Jenga API with Enhanced Error Handling
// const getJengaBearerToken = async () => {
//     try {
//         const response = await axios.post(
//             `${JENGA_API_URL}/authentication/api/v3/authenticate/merchant`,
//             {
//                 merchantCode: MERCHANT_CODE,
//                 consumerSecret: CONSUMER_SECRET
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Api-Key': API_KEY
//                 },
//                 timeout: 10000
//             }
//         );

//         return response.data.accessToken;
//     } catch (error) {
//         console.error('Jenga Token Generation Error:', {
//             status: error.response?.status,
//             data: error.response?.data,
//             message: error.message
//         });
        
//         throw new Error('Failed to generate Jenga Bearer Token');
//     }
// };

// // Perform STK Push with Signature and Comprehensive Error Handling
// const performSTKPush = async (accessToken, { phoneNumber, amount, reference }) => {
//     // Construct payload for STK Push
//     const payload = {
//         callbackUrl: CALLBACK_URL,
//         details: {
//             msisdn: phoneNumber.replace('+', '').replace(/^0/, '254'),
//             paymentAmount: parseFloat(amount)
//         },
//         payment: {
//             paymentReference: reference,
//             paymentCurrency: 'KES',
//             channel: 'MOBILE',
//             service: 'MPESA',
//             provider: 'JENGA'
//         }
//     };

//     try {
//         // Generate signature for the payload using actual values
//         const signatureMessage = `${MERCHANT_CODE}${amount}${reference}`;
        
//         const signature = generateSignature(PRIVATE_KEY_PATH, signatureMessage);

//         // Log payload and headers for debugging purposes
//         console.log('STK Push Payload:', JSON.stringify(payload, null, 2));
        
//         const headers = {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//             'Api-Key': API_KEY,
//             'Signature': signature
//         };
        
//         console.log('STK Push Headers:', headers);

//         // Make the STK Push request to Jenga API
//         const response = await axios.post(
//             `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`,
//             payload,
//             { headers }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('STK Push Error:', {
//             status: error.response?.status || 500,
//             data: error.response?.data || {},
//             message: error.message || "Request failed"
//         });

//         throw new Error(`STK Push failed with status code ${error.response?.status || 500}: ${error.message}`);
//     }
// };

// // STK Push Route
// router.post(
//     '/stk-push', 
//     authenticateToken,
//     validateFields(['amount', 'phoneNumber', 'reference', 'merchantName']),
//     async (req, res) => {
//         const { amount, phoneNumber, reference, merchantName } = req.body;

//         try {
//             const user = await User.findById(req.userId);
//             if (!user) {
//                 return res.status(404).json({ message: 'User not found' });
//             }

//             if (user.hasSubscribed) {
//                 return res.status(400).json({ message: 'User has already subscribed' });
//             }

//             const transaction = new Transaction({
//                 userId: req.userId,
//                 amount,
//                 currency: 'KES',
//                 telco: 'Safaricom',
//                 mobileNumber: phoneNumber,
//                 reference,
//                 merchantName,
//             });
            
//             await transaction.save();

//             const bearerToken = await getJengaBearerToken();
            
//             // Call performSTKPush with the necessary parameters
//             const stkPushResponse = await performSTKPush(bearerToken, { phoneNumber, amount, reference });

//             user.hasSubscribed = true;
//             await user.save();

//             res.status(200).json({
//                 message: 'Payment initiated successfully',
//                 transactionId: transaction._id,
//                 jengaResponse: stkPushResponse,
//                 "STK Push Payload": JSON.stringify(payload),
//                 "STK Push Headers": JSON.stringify(headers)
//              });
            
//          } catch(error ) {
//              console.error('Transaction Processing Failed:', error);
             
//              res.status(500).json({
//                  message: 'Transaction Processing Failed',
//                  error: error.message || 'An unexpected error occurred'
//              });
//          }
// });

// // Key Areas to Check and Fix for "Invalid Signature Keys Mapping!"
// // 1. Ensure the private key path is correct and the file is accessible.
// // 2. Confirm that the signature generation function is correctly creating the signature.
// // 3. Ensure the message being signed matches the expected format in the Jenga API documentation.
// // 4. Verify that your API credentials are correct and match those provided by Jenga.
// // 5. Double-check the headers in your STK Push request.

// module.exports = router;



const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User'); // Ensure this is used if querying users
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();

// Environment variables
const {
    API_KEY,
    MERCHANT_CODE,
    CONSUMER_SECRET,
    JENGA_API_URL,
    JWT_SECRET,
    PRIVATE_KEY_PATH,
    PUBLIC_KEY_PATH,
} = process.env;

// Function to generate RSA key pair (Private & Public Keys)
const generateKeyPair = () => {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048, // Key size in bits
            publicKeyEncoding: {
                type: 'spki', // Standard for public keys
                format: 'pem', // PEM format
            },
            privateKeyEncoding: {
                type: 'pkcs8', // Standard for private keys
                format: 'pem', // PEM format
            },
        });

        // Save keys to files
        fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
        fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

        console.log('RSA Key Pair generated and saved!');
        console.log(`Private Key Path: ${PRIVATE_KEY_PATH}`);
        console.log(`Public Key Path: ${PUBLIC_KEY_PATH}`);
    } catch (error) {
        console.error('Error generating RSA keys:', error);
    }
};

// Function to generate the signature using the private key
const generateSignature = (message) => {
    if (!fs.existsSync(PRIVATE_KEY_PATH)) {
        throw new Error(`Private key not found at ${PRIVATE_KEY_PATH}`);
    }

    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();

    // Sign using the private key and return in 'hex' encoding
    return sign.sign(privateKey, 'hex');
};

// Validation Middleware (Checking required fields)
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter((field) => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }
        next();
    };
};

// Token Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'No authentication token provided',
            error: 'Unauthorized',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        req.userId = decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired. Please log in again.',
                error: 'Unauthorized',
            });
        }

        console.error('Token Verification Error:', error);
        return res.status(403).json({
            message: 'Invalid token',
            error: error.message,
        });
    }
};

// Get Bearer Token from Jenga API
const getJengaBearerToken = async () => {
    try {
        const response = await axios.post(
            `${JENGA_API_URL}/authentication/api/v3/authenticate/merchant`,
            {
                merchantCode: MERCHANT_CODE,
                consumerSecret: CONSUMER_SECRET,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': API_KEY,
                },
                timeout: 10000,
            }
        );

        return response.data.accessToken;
    } catch (error) {
        console.error('Jenga Token Generation Error:', error.response?.data || error.message);
        throw new Error('Failed to generate Jenga Bearer Token');
    }
};

const performSTKPush = async (accessToken, { accountNumber, countryCode, merchantName, paymentRef, amount, currency, telco, mobileNumber, date, callBackUrl, pushType }) => {
    const payload = {
        merchant: {
            accountNumber: accountNumber,
            countryCode: countryCode,
            name: merchantName,
        },
        payment: {
            ref: paymentRef,
            amount: amount.toString(), // Ensure amount is a string
            currency: currency,
            telco: telco,
            mobileNumber: mobileNumber.replace('+', '').replace(/^0/, '254'), // Format phone number
            date: date,
            callBackUrl: callBackUrl,
            pushType: pushType,
        }
    };

    try {
        // Construct the signature message
        const signatureMessage = `${accountNumber}${paymentRef}${mobileNumber.replace('+', '').replace(/^0/, '254')}${telco}${amount}${currency}`;
        
        // Generate the signature
        const signature = generateSignature(signatureMessage);

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Api-Key': API_KEY,
            Signature: signature,
        };

        // Log for debugging
        console.log('STK Push Payload:', JSON.stringify(payload, null, 2));
        console.log('Signature Message:', signatureMessage);
        console.log('Generated Signature:', signature);
        console.log('Headers:', headers);

        // Make STK Push request
        const response = await axios.post(
            `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`,
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('STK Push Error:', error.response?.data || error.message);
        throw new Error(`STK Push failed with status code ${error.response?.status || 500}: ${error.message}`);
    }
};


// Route to perform STK Push
router.post('/stk-push', authenticateToken, validateFields(['accountNumber', 'countryCode', 'merchantName', 'paymentRef', 'amount', 'currency', 'telco', 'mobileNumber', 'date', 'callBackUrl', 'pushType']), async (req, res) => {
    try {
        const { accountNumber, countryCode, merchantName, paymentRef, amount, currency, telco, mobileNumber, date, callBackUrl, pushType } = req.body;

        // Get Jenga Bearer Token
        const accessToken = await getJengaBearerToken();

        // Call performSTKPush with all necessary parameters
        const response = await performSTKPush(accessToken, {
            accountNumber,
            countryCode,
            merchantName,
            paymentRef,
            amount,
            currency,
            telco,
            mobileNumber,
            date,
            callBackUrl,
            pushType
        });

        return res.json(response);
    } catch (error) {
        console.error('STK Push Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});


// Callback to handle transaction results from Mpesa
router.post('/callback', async (req, res) => {
    const { code, status, transactionReference, telcoReference, mobileNumber, requestAmount, debitedAmount, charge, telco } = req.body;

    // Handle transaction status
    switch (code) {
        case 3:
            console.log(`Transaction ${transactionReference} completed successfully and credited to merchant.`);
            break;
        case 4:
            console.log(`Transaction ${transactionReference} was successful but failed to credit merchant account.`);
            break;
        case 5:
            console.log(`Transaction ${transactionReference} was canceled by user.`);
            break;
        case 7:
            console.log(`Transaction ${transactionReference} was rejected due to validation errors.`);
            break;
        default:
            console.log(`Transaction ${transactionReference} status unknown.`);
            break;
    }

    // Save the transaction status in the database if necessary
    const transaction = await Transaction.findOne({ reference: transactionReference });
    if (transaction) {
        transaction.status = status;
        await transaction.save();
    }

    res.status(200).json({ message: 'Callback received and processed successfully' });
});

// Route to generate new RSA key pair
router.post('/generate-keys', async (req, res) => {
    try {
        generateKeyPair();
        res.status(200).json({ message: 'New RSA key pair generated successfully.' });
    } catch (error) {
        console.error('Error generating keys:', error);
        res.status(500).json({ message: 'Failed to generate keys', error });
    }
});

module.exports = router;
