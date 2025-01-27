// const express = require('express');
// const Transaction = require('../models/Transaction');
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const crypto = require('crypto');
// const fs = require('fs');
// require('dotenv').config();

// const router = express.Router();

// // Environment variables
// const {
//     API_KEY,
//     MERCHANT_CODE,
//     CONSUMER_SECRET,
//     JENGA_API_URL,
//     JWT_SECRET,
//     PRIVATE_KEY_PATH
// } = process.env;

// // Signature Generation Function
// function generateSignature(privateKeyPath, message) {
//     try {
//         const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
//         const sign = crypto.createSign('RSA-SHA256'); // Use RSA-SHA256 for better compatibility
//         sign.update(message);
//         return sign.sign(privateKey, 'base64'); // Return base64 encoded signature
//     } catch (error) {
//         console.error('Signature Generation Error:', error);
//         throw new Error('Failed to generate signature');
//     }
// }

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

// // Token Authentication Middleware
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

// // Get Bearer Token from Jenga API
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

// // Perform STK Push with Signature and Error Handling
// const performSTKPush = async (accessToken, { phoneNumber, amount, accountReference }) => {
//     // Prepare merchant and payment details
//     const merchant = {
//         accountNumber: process.env.MERCHANT_ACCOUNT_NUMBER || '1100194977404',
//         countryCode: 'KE',
//         name: process.env.MERCHANT_NAME || 'Your Merchant Name'
//     };

//     const payment = {
//         ref: accountReference,
//         amount: parseFloat(amount).toFixed(2), // Ensure amount is a float with 2 decimal places
//         currency: 'KES',
//         telco: 'Safaricom',
//         mobileNumber: phoneNumber.replace(/^0/, '254'), // Ensure phone number is in correct format
//         date: new Date().toISOString().split('T')[0],
//         callBackUrl: process.env.CALLBACK_URL || 'https://your-callback-url.com',
//         pushType: 'STK'
//     };

//     // Generate signature
//     const signatureMessage = [
//       merchant.accountNumber,
//       payment.ref,
//       payment.mobileNumber,
//       payment.telco,
//       payment.amount,
//       payment.currency
//     ].join('');

//     const signature = generateSignature(PRIVATE_KEY_PATH, signatureMessage);

//     try {
//         const response = await axios.post(
//             `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`,
//             { merchant, payment },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     Signature: signature // Include the generated signature in the headers
//                 },
//                 timeout: 15000
//             }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('Jenga STK Push Detailed Error:', {
//             status: error.response?.status,
//             data: error.response?.data,
//             message: error.message
//         });

//         // Detailed error handling for specific status codes
//         if (error.response) {
//             switch (error.response.status) {
//                 case 400:
//                     throw new Error(`Bad Request: ${error.response.data.message}`);
//                 case 401:
//                     throw new Error('Unauthorized: Invalid credentials or signature');
//                 case 404:
//                     throw new Error('Resource not found');
//                 default:
//                     throw new Error('STK Push Transaction Failed');
//             }
//         } else {
//             throw new Error('Network error during STK Push');
//         }
//     }
// };

// // Generate Jenga Token Endpoint
// router.get('/generate-jenga-token', async (req, res) => {
//     try {
//         const bearerToken = await getJengaBearerToken();
//         res.json({ bearerToken });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Token Generation Failed', 
//             error: error.message 
//         });
//     }
// });

// // STK Push - Initiate Payment with Field Validation
// router.post(
//     '/stk-push', 
//     authenticateToken,
//     validateFields(['amount', 'phoneNumber', 'reference']),
//     async (req, res) => {
//       const { amount, phoneNumber, reference } = req.body;

//       try {
//           const user = await User.findById(req.userId);
//           if (!user) {
//               return res.status(404).json({ message: 'User not found' });
//           }

//           if (user.hasSubscribed) {
//               return res.status(400).json({ message: 'User has already subscribed' });
//           }

//           const transaction = new Transaction({
//               userId: req.userId,
//               amount,
//               currency: 'KES',
//               telco: 'Safaricom',
//               mobileNumber: phoneNumber,
//               reference,
//               merchantName: process.env.MERCHANT_NAME || 'Your Merchant Name'
//           });
          
//           await transaction.save();

//           const bearerToken = await getJengaBearerToken();
          
//           const stkPushResponse = await performSTKPush(bearerToken, {
//               phoneNumber,
//               amount,
//               accountReference: reference
//           });

//           user.hasSubscribed = true;
//           await user.save();

//           res.status(200).json({
//               message: 'Payment initiated successfully',
//               transactionId: transaction._id,
//               jengaResponse: stkPushResponse,
//           });
          
//       } catch (error) {
//           console.error('Transaction Processing Failed:', error);
          
//           res.status(500).json({
//               message: 'Transaction Processing Failed',
//               error: error.message || "An unknown error occurred"
//           });
          
//       }
// });

// // Record Transaction from Dart app
// router.post('/transactions', authenticateToken, async (req, res) => {
//    const { amount, currency, telco, mobileNumber, date, reference, merchantName } = req.body;

//    try {
//        const transaction = new Transaction({
//            userId: req.userId,
//            amount,
//            currency,
//            telco,
//            mobileNumber,
//            date,
//            reference,
//            merchantName,
//        });

//        await transaction.save();
//        res.status(201).json(transaction);
//    } catch (error) {
//        console.error('Transaction Error:', error);
//        res.status(500).json({ message: 'Error recording transaction' });
//    }
// });

// // Get Transactions for User
// router.get('/transactions', authenticateToken, async (req, res) => {
//    try {
//        const transactions = await Transaction.find({ userId: req.userId });
//        res.status(200).json(transactions);
//    } catch (error) {
//        console.error('Fetch Transactions Error:', error);
//        res.status(500).json({ message: 'Error fetching transactions' });
//    }
// });

// module.exports = router;

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
//     PRIVATE_KEY_PATH
// } = process.env;

// // Enhanced Signature Generation Function
// function generateSignature(privateKeyPath, message) {
//     try {
//         // Resolve absolute path for private key
//         const resolvedKeyPath = path.resolve(privateKeyPath);

//         // Validate private key file exists
//         if (!fs.existsSync(resolvedKeyPath)) {
//             throw new Error(`Private key not found at ${resolvedKeyPath}`);
//         }

//         // Read private key
//         const privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');

//         // Create signature
//         const sign = crypto.createSign('SHA256');
//         sign.update(message);
//         const signature = sign.sign(privateKey, 'base64');

//         return signature;
//     } catch (error) {
//         console.error('Signature Generation Error:', error);
//         throw new Error(`Failed to generate signature: ${error.message}`);
//     }
// }

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
//         const decoded = jwt.verify(token, JWT_SECRET, {
//             algorithms: ['HS256']
//         });

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
//             'https://uat.finserve.africa/authentication/api/v3/authenticate/merchant',
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

// const performSTKPush = async (accessToken, { phoneNumber, amount, accountReference }) => {
//     // Prepare merchant and payment details
//     const merchant = {
//         accountNumber: MERCHANT_ACCOUNT_NUMBER || '1100194977404',
//         countryCode: 'KE',
//         name: MERCHANT_NAME || 'Your Merchant Name'
//     };

//     const payment = {
//         ref: accountReference,
//         amount: parseFloat(amount).toFixed(2), // Ensure amount has two decimal places
//         currency: 'KES',
//         telco: 'Safaricom',
//         mobileNumber: phoneNumber.replace(/^0/, '254'), // Convert to international format
//         date: new Date().toISOString().split('T')[0], // Format date as YYYY-MM-DD
//         callBackUrl: CALLBACK_URL || 'https://your-callback-url.com', // Your callback URL
//         pushType: 'STK'
//     };

//     // Generate signature message by concatenating required fields
//     const signatureMessage = [
//         merchant.accountNumber,
//         payment.ref,
//         payment.mobileNumber,
//         payment.telco,
//         payment.amount,
//         payment.currency
//     ].join('');

//     // Generate signature using private key
//     const signature = generateSignature(PRIVATE_KEY_PATH, signatureMessage);

//     try {
//         const response = await axios.post(
//             `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`,
//             { merchant, payment },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     Signature: signature
//                 },
//                 timeout: 15000 // Set timeout for request (15 seconds)
//             }
//         );

//         return response.data; // Return response data from Jenga API
//     } catch (error) {
//         console.error('Jenga STK Push Detailed Error:', {
//             status: error.response?.status,
//             data: error.response?.data,
//             message: error.message
//         });

//         if (error.response) {
//             switch (error.response.status) {
//                 case 400:
//                     throw new Error(`Bad Request: ${error.response.data.message}`);
//                 case 401:
//                     throw new Error('Unauthorized: Invalid credentials or signature');
//                 case 404:
//                     throw new Error('Resource not found');
//                 default:
//                     throw new Error('STK Push Transaction Failed');
//             }
//         } else {
//             throw new Error('Network error during STK Push');
//         }
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
//             const stkPushResponse = await performSTKPush(bearerToken, {
//                 phoneNumber,
//                 amount,
//                 accountReference: reference,
//                 transactionDesc: 'Subscription Payment'
//             });

//             user.hasSubscribed = true;
//             await user.save();

//             res.status(200).json({
//                 message: 'Payment initiated successfully',
//                 transactionId: transaction._id,
//                 jengaResponse: stkPushResponse,
//             });
//         } catch (error) {
//             console.error('STK Push Error:', error);
//             res.status(500).json({
//                 message: 'Transaction Processing Failed',
//                 error: error.message
//             });
//         }
//     }
// );

// Record Transaction from Dart app
// router.post('/transactions', authenticateToken, async (req, res) => {
//    const { amount, currency, telco, mobileNumber, date, reference, merchantName } = req.body;

//    try {
//        const transaction = new Transaction({
//            userId: req.userId,
//            amount,
//            currency,
//            telco,
//            mobileNumber,
//            date,
//            reference,
//            merchantName,
//        });

//        await transaction.save();
//        res.status(201).json(transaction);
//    } catch (error) {
//        console.error('Transaction Error:', error);
//        res.status(500).json({ message: 'Error recording transaction' });
//    }
// });

// // Get Transactions for User
// router.get('/transactions', authenticateToken, async (req, res) => {
//    try {
//        const transactions = await Transaction.find({ userId: req.userId });
//        res.status(200).json(transactions);
//    } catch (error) {
//        console.error('Fetch Transactions Error:', error);
//        res.status(500).json({ message: 'Error fetching transactions' });
//    }
// });

// module.exports = router;

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
//     PRIVATE_KEY_PATH
// } = process.env;

// // Enhanced Signature Generation Function
// function generateSignature(privateKeyPath, message) {
//     try {
//         // Resolve absolute path for private key
//         const resolvedKeyPath = path.resolve(privateKeyPath);

//         // Validate private key file exists
//         if (!fs.existsSync(resolvedKeyPath)) {
//             throw new Error(`Private key not found at ${resolvedKeyPath}`);
//         }

//         // Read private key
//         const privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');

//         // Create signature
//         const sign = crypto.createSign('SHA256');
//         sign.update(message);
//         const signature = sign.sign(privateKey, 'base64');

//         return signature;
//     } catch (error) {
//         console.error('Signature Generation Error:', error);
//         throw new Error(`Failed to generate signature: ${error.message}`);
//     }
// }

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
//         const decoded = jwt.verify(token, JWT_SECRET, {
//             algorithms: ['HS256']
//         });

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
// // Get Bearer Token from Jenga API with Enhanced Error Handling
// const getJengaBearerToken = async () => {
//     try {
//         const response = await axios.post(
//             `${JENGA_API_URL}/authentication/api/v3/authenticate/merchant`, // Use JENGA_API_URL from env for flexibility
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
        
//         // Log successful response for debugging
//         console.log('Jenga Token Response:', response.data);

//         // Return the access token
//         return response.data.accessToken;
//     } catch (error) {
//         // Improved error handling and logging for better debugging
//         console.error('Error during Jenga token generation:', error);
        
//         if (error.response) {
//             console.error('Response Error:', error.response.data);
//             if (error.response.status === 401) {
//                 throw new Error('Unauthorized: Invalid API credentials');
//             }
//         }

//         throw new Error('Failed to generate Jenga Bearer Token');
//     }
// };

// // Perform STK Push with Signature and Comprehensive Error Handling
// // Perform STK Push with Signature and Comprehensive Error Handling
// const performSTKPush = async (accessToken, { phoneNumber, amount, accountReference, transactionDesc }) => {
//     const merchant = {
//         accountNumber: process.env.MERCHANT_ACCOUNT_NUMBER || '1100194977404',
//         countryCode: 'KE',
//         name: process.env.MERCHANT_NAME || 'Your Merchant Name'
//     };

//     const payment = {
//         ref: accountReference,
//         amount: amount.toString(),
//         currency: 'KES',
//         telco: 'Safaricom',
//         mobileNumber: phoneNumber,
//         date: new Date().toISOString().split('T')[0],
//         callBackUrl: process.env.CALLBACK_URL || 'https://your-callback-url.com',
//         pushType: 'STK'
//     };

//     // Generate signature for the request
//     const signatureMessage = `${merchant.accountNumber}${payment.ref}${payment.mobileNumber}${payment.telco}${payment.amount}${payment.currency}`;
//     const signature = generateSignature(PRIVATE_KEY_PATH, signatureMessage);

//     try {
//         const response = await axios.post(
//             `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`, // Use JENGA_API_URL from env for flexibility
//             { merchant, payment },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     'Signature': signature
//                 },
//                 timeout: 15000
//             }
//         );

//         return response.data;
//     } catch (error) {
//         console.error('Detailed STK Push Error:', error);

//         if (error.response) {
//             console.error('STK Push API Response Error:', error.response.data);
//             if (error.response.status === 401) {
//                 throw new Error(`Unauthorized: Invalid credentials. Response: ${JSON.stringify(error.response.data)}`);
//             }
//         }

//         throw new Error('STK Push failed');
//     }
// };


// // STK Push Route
// router.post('/stk-push', authenticateToken, validateFields(['amount', 'phoneNumber', 'reference', 'merchantName']), async (req, res) => {
//     const { amount, phoneNumber, reference, merchantName } = req.body;

//     try {
//         const user = await User.findById(req.userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         if (user.hasSubscribed) {
//             return res.status(400).json({ message: 'User has already subscribed' });
//         }

//         const transaction = new Transaction({
//             userId: req.userId,
//             amount,
//             currency: 'KES',
//             telco: 'Safaricom',
//             mobileNumber: phoneNumber,
//             reference,
//             merchantName,
//         });
//         await transaction.save();

//         console.log('Transaction saved:', transaction);

//         const bearerToken = await getJengaBearerToken();
//         const stkPushResponse = await performSTKPush(bearerToken, {
//             phoneNumber,
//             amount,
//             accountReference: reference,
//             transactionDesc: 'Subscription Payment'
//         });

//         user.hasSubscribed = true;
//         await user.save();

//         console.log('STK Push Response:', stkPushResponse);

//         res.status(200).json({
//             message: 'Payment initiated successfully',
//             transactionId: transaction._id,
//             jengaResponse: stkPushResponse,
//         });
//     } catch (error) {
//         console.error('STK Push Error:', error);
//         res.status(500).json({
//             message: 'Transaction Processing Failed',
//             error: error.message
//         });
//     }
// });


// // Record Transaction from Dart app
// router.post('/transactions', authenticateToken, async (req, res) => {
//    const { amount, currency, telco, mobileNumber, date, reference, merchantName } = req.body;

//    try {
//        const transaction = new Transaction({
//            userId: req.userId,
//            amount,
//            currency,
//            telco,
//            mobileNumber,
//            date,
//            reference,
//            merchantName,
//        });

//        await transaction.save();
//        res.status(201).json(transaction);
//    } catch (error) {
//        console.error('Transaction Error:', error);
//        res.status(500).json({ message: 'Error recording transaction' });
//    }
// });

// // Get Transactions for User
// router.get('/transactions', authenticateToken, async (req, res) => {
//    try {
//        const transactions = await Transaction.find({ userId: req.userId });
//        res.status(200).json(transactions);
//    } catch (error) {
//        console.error('Fetch Transactions Error:', error);
//        res.status(500).json({ message: 'Error fetching transactions' });
//    }
// });

// module.exports = router;

const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const router = express.Router();

// Environment variables
const {
    API_KEY,
    MERCHANT_CODE,
    CONSUMER_SECRET,
    JENGA_API_URL,
    JWT_SECRET,
    PRIVATE_KEY_PATH
} = process.env;

// Enhanced Signature Generation Function
function generateSignature(privateKeyPath, message) {
    try {
        // Resolve absolute path for private key
        const resolvedKeyPath = path.resolve(privateKeyPath);

        // Validate private key file exists
        if (!fs.existsSync(resolvedKeyPath)) {
            throw new Error(`Private key not found at ${resolvedKeyPath}`);
        }

        // Read private key
        const privateKey = fs.readFileSync(resolvedKeyPath, 'utf8');

        // Create signature
        const sign = crypto.createSign('SHA256');
        sign.update(message);
        const signature = sign.sign(privateKey, 'base64');

        return signature;
    } catch (error) {
        console.error('Signature Generation Error:', error);
        throw new Error(`Failed to generate signature: ${error.message}`);
    }
}

// Validation Middleware
const validateFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        next();
    };
};

// Enhanced Token Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            message: 'No authentication token provided',
            error: 'Unauthorized' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });

        if (!decoded.id) {
            return res.status(403).json({ 
                message: 'Invalid token structure',
                error: 'Forbidden' 
            });
        }

        req.userId = decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token Verification Error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                error: 'Please login again' 
            });
        }

        return res.status(403).json({ 
            message: 'Invalid token',
            error: error.message 
        });
    }
};

// Get Bearer Token from Jenga API with Enhanced Error Handling
const getJengaBearerToken = async () => {
    try {
        const response = await axios.post(
            `${JENGA_API_URL}/authentication/api/v3/authenticate/merchant`, // Use JENGA_API_URL from env for flexibility
            {
                merchantCode: MERCHANT_CODE,
                consumerSecret: CONSUMER_SECRET
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': API_KEY
                },
                timeout: 10000
            }
        );
        
        // Log successful response for debugging
        console.log('Jenga Token Response:', response.data);

        // Return the access token
        return response.data.accessToken;
    } catch (error) {
        // Improved error handling and logging for better debugging
        console.error('Error during Jenga token generation:', error);
        
        if (error.response) {
            console.error('Response Error:', error.response.data);
            if (error.response.status === 401) {
                throw new Error('Unauthorized: Invalid API credentials');
            }
        }

        throw new Error('Failed to generate Jenga Bearer Token');
    }
};

// Perform STK Push with Signature and Comprehensive Error Handling
const performSTKPush = async (accessToken, { phoneNumber, amount, accountReference, transactionDesc }) => {
    const merchant = {
        accountNumber: process.env.MERCHANT_ACCOUNT_NUMBER || '1100194977404',
        countryCode: 'KE',
        name: process.env.MERCHANT_NAME || 'Your Merchant Name'
    };

    const payment = {
        ref: accountReference,
        amount: amount.toString(),
        currency: 'KES',
        telco: 'Safaricom',
        mobileNumber: phoneNumber,
        date: new Date().toISOString().split('T')[0],
        callBackUrl: process.env.CALLBACK_URL || 'https://your-callback-url.com',
        pushType: 'STK'
    };

    // Generate signature for the request
    const signatureMessage = `${merchant.accountNumber}${payment.ref}${payment.mobileNumber}${payment.telco}${payment.amount}${payment.currency}`;
    const signature = generateSignature(PRIVATE_KEY_PATH, signatureMessage);

    try {
        const response = await axios.post(
            `${JENGA_API_URL}/v3-apis/payment-api/v3.0/stkussdpush/initiate`, // Use JENGA_API_URL from env for flexibility
            { merchant, payment },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Signature': signature
                },
                timeout: 15000
            }
        );

        return response.data;
    } catch (error) {
        console.error('Detailed STK Push Error:', error);

        if (error.response) {
            console.error('STK Push API Response Error:', error.response.data);
            if (error.response.status === 401) {
                throw new Error(`Unauthorized: Invalid credentials. Response: ${JSON.stringify(error.response.data)}`);
            }
        }

        throw new Error('STK Push failed');
    }
};

// STK Push Route
router.post('/stk-push', authenticateToken, validateFields(['amount', 'phoneNumber', 'reference', 'merchantName']), async (req, res) => {
    const { amount, phoneNumber, reference, merchantName } = req.body;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has already subscribed
        if (user.hasSubscribed) {
            return res.status(400).json({ message: 'User has already subscribed' });
        }

        // Save the transaction in the database
        const transaction = new Transaction({
            userId: req.userId,
            amount,
            currency: 'KES',
            telco: 'Safaricom',
            mobileNumber: phoneNumber,
            reference,
            merchantName,
        });
        await transaction.save();

        console.log('Transaction saved:', transaction);

        // Get Jenga bearer token
        const bearerToken = await getJengaBearerToken();
        
        // Perform STK push to initiate the payment
        const stkPushResponse = await performSTKPush(bearerToken, {
            phoneNumber,
            amount,
            accountReference: reference,
            transactionDesc: 'Subscription Payment'
        });

        // If the payment is successful, update the user's subscription status
        if (stkPushResponse && stkPushResponse.status === 'SUCCESS') {
            user.hasSubscribed = true; // Set hasSubscribed to true
            await user.save();

            console.log('STK Push Response:', stkPushResponse);
            res.status(200).json({
                message: 'Payment initiated successfully, user subscription updated',
                transactionId: transaction._id,
                jengaResponse: stkPushResponse,
            });
        } else {
            return res.status(400).json({
                message: 'Payment failed. Please try again later.',
                error: stkPushResponse || 'Unknown error',
            });
        }
    } catch (error) {
        console.error('STK Push Error:', error);
        res.status(500).json({
            message: 'Transaction Processing Failed',
            error: error.message
        });
    }
});




// Callback route to handle Jenga API response and update the user subscription status
router.post('/payment-callback', async (req, res) => {
    const { status, transactionId, amount, mobileNumber, reference, merchantAccount, merchantName, userId, message } = req.body;

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check the payment status
        if (status === "SUCCESS") {
            // Update the user's subscription status to 'true'
            user.hasSubscribed = true;
            await user.save();

            // You can also update the transaction record if needed
            const transaction = await Transaction.findOne({ reference });
            if (transaction) {
                transaction.status = 'PAID';
                await transaction.save();
            }

            return res.status(200).json({
                message: 'Subscription updated successfully',
                userId: user._id,
                status: 'Payment successful'
            });
        } else {
            return res.status(400).json({ message: 'Payment failed', status });
        }

    } catch (error) {
        console.error('Payment Callback Error:', error);
        return res.status(500).json({
            message: 'An error occurred during the payment callback',
            error: error.message
        });
    }
});


// Record Transaction from Dart app
router.post('/transactions', authenticateToken, async (req, res) => {
   const { amount, currency, telco, mobileNumber, date, reference, merchantName } = req.body;

   try {
       const transaction = new Transaction({
           userId: req.userId,
           amount,
           currency,
           telco,
           mobileNumber,
           date,
           reference,
           merchantName,
       });

       await transaction.save();
       res.status(201).json(transaction);
   } catch (error) {
       console.error('Transaction Error:', error);
       res.status(500).json({ message: 'Error recording transaction' });
   }
});

// Get Transactions for User
router.get('/transactions', authenticateToken, async (req, res) => {
   try {
       const transactions = await Transaction.find({ userId: req.userId });
       res.status(200).json(transactions);
   } catch (error) {
       console.error('Fetch Transactions Error:', error);
       res.status(500).json({ message: 'Error fetching transactions' });
   }
});

module.exports = router;

