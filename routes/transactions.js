// const express = require('express');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const dotenv = require('dotenv');
// // const { getAccessToken } = require('../generateToken');
// const Transaction = require('../models/Transaction');
// const User = require('../models/User');

// dotenv.config();

// const router = express.Router();

// const {
//     MERCHANT_ACCOUNT_NUMBER,
//     MERCHANT_NAME,
//     CALLBACK_URL,
// } = process.env;

// const API_KEY = "Y5e2cRT3sQ/4iQg+TO69mY3CZ9QMNM2n8vzKHAsbvNdl9zXYCBItLGcHECjXhrjmxJLp+0pJCNnck8+abpw2RA==";
// const MERCHANT_CODE = "5685692761";
// const CONSUMER_SECRET = "9neJ1NL36uN4MGU3fOt4pv834haTCp";

// async function getAccessToken() {
//     try {
//         const response = await axios.post(
//             "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
//             {
//                 merchantCode: MERCHANT_CODE,
//                 consumerSecret: CONSUMER_SECRET
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Api-Key": API_KEY
//                 }
//             }
//         );
//         return response.data.accessToken;
//     } catch (error) {
//         throw new Error("Error getting access token: " + (error.response?.data || error.message));
//     }
// }

// const validateFields = (requiredFields) => (req, res, next) => {
//     const missingFields = requiredFields.filter(field => !req.body[field]);
//     if (missingFields.length > 0) {
//         return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
//     }
//     next();
// };

// const performSTKPush = async ({ phoneNumber, amount, accountReference }) => {
//     try {
//         const accessToken = await getAccessToken();
//         const response = await axios.post(
//             "https://uat.finserve.africa/v3-apis/payment-api/v3.0/stkussdpush/initiate",
//             {
//                 merchant: {
//                     accountNumber: MERCHANT_ACCOUNT_NUMBER,
//                     countryCode: 'KE',
//                     name: MERCHANT_NAME
//                 },
//                 payment: {
//                     ref: accountReference,
//                     amount: amount.toString(),
//                     currency: 'KES',
//                     telco: 'Safaricom',
//                     mobileNumber: phoneNumber,
//                     date: new Date().toISOString().split('T')[0],
//                     callBackUrl: CALLBACK_URL,
//                     pushType: 'USSD'
//                 }
//             },
//             { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, timeout: 15000 }
//         );
//         return response.data;
//     } catch (error) {
//         throw new Error('STK Push failed: ' + (error.response?.data || error.message));
//     }
// };

// router.post('/stk-push', validateFields(['amount', 'phoneNumber', 'reference', 'merchantName']), async (req, res) => {
//     try {
//         const { amount, phoneNumber, reference, merchantName } = req.body;
//         const user = await User.findById(req.userId);
//         if (!user || user.hasSubscribed) return res.status(400).json({ message: 'Invalid request' });

//         const transaction = new Transaction({
//             userId: req.userId,
//             amount,
//             currency: 'KES',
//             telco: 'Safaricom',
//             mobileNumber: phoneNumber,
//             reference,
//             merchantName,
//             merchantAccountNumber: MERCHANT_ACCOUNT_NUMBER,
//             status: 'pending',
//         });
//         await transaction.save();

//         const stkPushResponse = await performSTKPush({ phoneNumber, amount, accountReference: reference });
//         if (stkPushResponse?.status === 'SUCCESS') {
//             user.hasSubscribed = true;
//             await user.save();
//             return res.status(200).json({ message: 'Payment initiated successfully', transactionId: transaction._id, jengaResponse: stkPushResponse });
//         }
//         return res.status(400).json({ message: 'Payment failed', error: stkPushResponse || 'Unknown error' });
//     } catch (error) {
//         res.status(500).json({ message: 'Transaction Processing Failed', error: error.message });
//     }
// });

// router.post('/payment-callback', async (req, res) => {
//     try {
//         const { status, transactionId, reference, userId } = req.body;
//         const user = await User.findById(userId);
//         const transaction = await Transaction.findOne({ reference });
//         if (!user || !transaction) return res.status(404).json({ message: 'User or transaction not found' });

//         transaction.status = status === "SUCCESS" ? 'completed' : 'failed';
//         if (status === "SUCCESS") {
//             user.hasSubscribed = true;
//             await user.save();
//             transaction.transactionId = transactionId;
//         }
//         await transaction.save();
//         return res.status(200).json({ message: status === "SUCCESS" ? 'Subscription updated successfully' : 'Payment failed', status });
//     } catch (error) {
//         return res.status(500).json({ message: 'Error processing callback', error: error.message });
//     }
// });

// module.exports = router;
// const express = require('express');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const dotenv = require('dotenv');
// const crypto = require('crypto');
// const Transaction = require('../models/Transaction');

// dotenv.config();

// const router = express.Router();

// const {
//     MERCHANT_ACCOUNT_NUMBER,
//     MERCHANT_NAME,
//     CALLBACK_URL,
// } = process.env;

// const API_KEY =
//   "Y5e2cRT3sQ/4iQg+TO69mY3CZ9QMNM2n8vzKHAsbvNdl9zXYCBItLGcHECjXhrjmxJLp+0pJCNnck8+abpw2RA==";
// const MERCHANT_CODE =
//   "5685692761";
// const CONSUMER_SECRET =
//   "9neJ1NL36uN4MGU3fOt4pv834haTCp";

// const {
//     generateSignature,
//     getSignatureFromAPI,
//     compareSignatures
// } = require("./signature"); // Import all three functionsy


// // Test Route for Signature Generation
// router.post('/generate-test-signature', async (req, res) => {
//     try {
//         const {
//             rawText,
//             privateKeyString
//         } = req.body;
//         if (!rawText || !privateKeyString) {
//             return res.status(400).json({
//                 message: "Missing rawText or privateKeyString"
//             });
//         }

//         const generatedSignature = await generateSignature(rawText, privateKeyString); // Use API function
//         console.log("Generated Signature:", generatedSignature);

//         res.status(200).json({
//             signature: generatedSignature
//         });
//     } catch (error) {
//         console.error("Error generating signature:", error);
//         res.status(500).json({
//             message: "Error generating signature",
//             error: error.message
//         });
//     }
// });

// async function getAccessToken() {
//     try {
//         const response = await axios.post(
//             "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
//             {
//                 merchantCode: MERCHANT_CODE,
//                 consumerSecret: CONSUMER_SECRET
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "ApiKey": API_KEY
//                 }
//             }
//         );
//         console.log("Access Token:", response.data.accessToken);
//         return response.data.accessToken;
//     } catch (error) {
//         console.error("Error getting access token:", error.response ? error.response.data : error.message);
//         throw new Error(`Error getting access token: ${error.message}`);
//     }
// }

// async function performSTKPush({
//     phoneNumber,
//     amount,
//     accountReference,
//     privateKeyString
// }) {
//     try {
//         const rawTextForSignatureGeneration = `${MERCHANT_ACCOUNT_NUMBER}${accountReference}${phoneNumber}Safaricom${amount}KES`;
//         const generatedSignature = await generateSignature(rawTextForSignatureGeneration, privateKeyString); // Use the API function
//         console.log("Generated Signature (Local):", generatedSignature);

//         const accessToken = await getAccessToken();

//         const stkPushResponseFromAPI = await axios.post(
//             'https://uat.finserve.africa/v3-apis/payment-api/v3.0/stkussdpush/initiate',
//             {
//                 merchant: {
//                     accountNumber: MERCHANT_ACCOUNT_NUMBER,
//                     countryCode: 'KE',
//                     name: MERCHANT_NAME
//                 },
//                 payment: {
//                     ref: accountReference,
//                     amount: amount.toString(),
//                     currency: 'KES',
//                     telco: 'Safaricom',
//                     mobileNumber: phoneNumber,
//                     date: new Date().toISOString().split('T')[0],
//                     callBackUrl: CALLBACK_URL,
//                     pushType: "STK"
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     'Signature': generatedSignature
//                 },
//                 timeout: 15000
//             }
//         );

//         return stkPushResponseFromAPI.data;
//     } catch (error) {
//         console.error("STK Push Error:", error.response ? error.response.data : error.message);
//         throw new Error(`Error performing STK Push: ${error.message}`);
//     }
// }
// // async function verifySignature(rawText, signature, publicKeyString) {
// //     try {
// //         const response = await axios.post(
// //             "https://api-finserve-dev.finserve.africa/authentication/api/v3/verify/signature",
// //             {
// //                 rawText,
// //                 signature,
// //                 publicKeyString
// //             }
// //         );
// //         console.log("Signature Verification Response:", response.data);
// //         return response.data; // Return the entire response
// //     } catch (error) {
// //         console.error("Error verifying signature:", error.response ? error.response.data : error.message);
// //         throw new Error(`Error verifying signature: ${error.message}`);
// //     }
// // }

// // STK Push

// router.post('/stk-push', async (req, res) => {
//     try {
//         if (!req.body.amount || !req.body.phoneNumber || !req.body.reference) {
//             return res.status(400).json({
//                 message: "Missing required fields (amount, phoneNumber, reference)"
//             });
//         }

//         if (!MERCHANT_ACCOUNT_NUMBER || !CALLBACK_URL || !MERCHANT_NAME) {
//             return res.status(500).json({
//                 message: "Server configuration incomplete"
//             });
//         }

//         const transaction = new Transaction({
//             userId: req.userId || "67a5f218db306cedba9ed66a",
//             amount: req.body.amount,
//             currency: 'KES',
//             telco: 'Safaricom',
//             mobileNumber: req.body.phoneNumber,
//             reference: req.body.reference,
//             merchantName: MERCHANT_NAME || "Example Acc",
//             merchantAccountNumber: 1100194977404,
//             status: "pending"
//         });

//         await transaction.save();
//         console.log("Transaction saved successfully");

//         const stkPushResponse = await performSTKPush({
//             phoneNumber: req.body.phoneNumber,
//             amount: req.body.amount,
//             accountReference: req.body.reference
//             // privateKeyString: req.body.privateKeyString
//         });

//         console.log("STK Push Response:", stkPushResponse);

//         if (stkPushResponse && stkPushResponse.status === "SUCCESS") {
//             return res.status(200).json({
//                 message: "Payment initiated successfully",
//                 transactionId: transaction._id
//             });
//         } else {
//             throw new Error(`STK push failed: ${stkPushResponse ? JSON.stringify(stkPushResponse) : 'Unknown error'}`);
//         }

//     } catch (error) {
//         console.error("Transaction Processing Failed:", error);
//         res.status(500).json({
//             message: "Transaction Processing Failed",
//             error: error.message
//         });
//     }
// });

// module.exports = router;


// const express = require('express');
// const fs = require('fs');
// const jwt = require('jsonwebtoken');
// const axios = require('axios');
// const dotenv = require('dotenv');
// const crypto = require('crypto');
// const Transaction = require('../models/Transaction');

// dotenv.config();

// const router = express.Router();

// const {
//     MERCHANT_ACCOUNT_NUMBER,
//     MERCHANT_NAME,
//     CALLBACK_URL,
// } = process.env;

// const API_KEY =
//   "Y5e2cRT3sQ/4iQg+TO69mY3CZ9QMNM2n8vzKHAsbvNdl9zXYCBItLGcHECjXhrjmxJLp+0pJCNnck8+abpw2RA==";
// const MERCHANT_CODE =
//   "5685692761";
// const CONSUMER_SECRET =
//   "9neJ1NL36uN4MGU3fOt4pv834haTCp";

// const {
//     generateSignature
// } = require("./signature"); // Only import generateSignature now


// // Test Route for Signature Generation
// router.post('/generate-test-signature', async (req, res) => {
//     try {
//         const {
//             rawText,
//             privateKeyString
//         } = req.body;
//         if (!rawText || !privateKeyString) {
//             return res.status(400).json({
//                 message: "Missing rawText or privateKeyString"
//             });
//         }

//         const generatedSignature = await generateSignature(rawText); // Use generateSignature directly
//         console.log("Generated Signature:", generatedSignature);

//         res.status(200).json({
//             signature: generatedSignature
//         });
//     } catch (error) {
//         console.error("Error generating signature:", error);
//         res.status(500).json({
//             message: "Error generating signature",
//             error: error.message
//         });
//     }
// });

// async function getAccessToken() {
//     try {
//         const response = await axios.post(
//             "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
//             {
//                 merchantCode: MERCHANT_CODE,
//                 consumerSecret: CONSUMER_SECRET
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "ApiKey": API_KEY
//                 }
//             }
//         );
//         console.log("Access Token:", response.data.accessToken);
//         return response.data.accessToken;
//     } catch (error) {
//         console.error("Error getting access token:", error.response ? error.response.data : error.message);
//         throw new Error(`Error getting access token: ${error.message}`);
//     }
// }

// async function performSTKPush({
//     phoneNumber,
//     amount,
//     accountReference,
//     privateKeyString
// }) {
//     try {
//         // Removed getSignatureFromAPI and directly use generateSignature
//         const rawTextForSignatureGeneration = `${MERCHANT_ACCOUNT_NUMBER}${accountReference}${phoneNumber}Safaricom${amount}KES`;
//         const generatedSignature = await generateSignature(rawTextForSignatureGeneration); // Use generateSignature directly
//         console.log("Generated Signature (Local):", generatedSignature);

//         const accessToken = await getAccessToken();

//         const stkPushResponseFromAPI = await axios.post(
//             'https://uat.finserve.africa/v3-apis/payment-api/v3.0/stkussdpush/initiate',
//             {
//                 merchant: {
//                     accountNumber: MERCHANT_ACCOUNT_NUMBER,
//                     countryCode: 'KE',
//                     name: MERCHANT_NAME
//                 },
//                 payment: {
//                     ref: accountReference,
//                     amount: amount.toString(),
//                     currency: 'KES',
//                     telco: 'Safaricom',
//                     mobileNumber: phoneNumber,
//                     date: new Date().toISOString().split('T')[0],
//                     callBackUrl: CALLBACK_URL,
//                     pushType: "STK"
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     'Content-Type': 'application/json',
//                     'Signature': generatedSignature
//                 },
//                 timeout: 15000
//             }
//         );

//         return stkPushResponseFromAPI.data;
//     } catch (error) {
//         console.error("STK Push Error:", error.response ? error.response.data : error.message);
//         throw new Error(`Error performing STK Push: ${error.message}`);
//     }
// }

// // STK Push
// router.post('/stk-push', async (req, res) => {
//     try {
//         if (!req.body.amount || !req.body.phoneNumber || !req.body.reference) {
//             return res.status(400).json({
//                 message: "Missing required fields (amount, phoneNumber, reference)"
//             });
//         }

//         if (!MERCHANT_ACCOUNT_NUMBER || !CALLBACK_URL || !MERCHANT_NAME) {
//             return res.status(500).json({
//                 message: "Server configuration incomplete"
//             });
//         }

//         const transaction = new Transaction({
//             userId: req.userId || "67a5f218db306cedba9ed66a",
//             amount: req.body.amount,
//             currency: 'KES',
//             telco: 'Safaricom',
//             mobileNumber: req.body.phoneNumber,
//             reference: req.body.reference,
//             merchantName: MERCHANT_NAME || "Example Acc",
//             merchantAccountNumber: 1100194977404,
//             status: "pending"
//         });

//         await transaction.save();
//         console.log("Transaction saved successfully");

//         const stkPushResponse = await performSTKPush({
//             phoneNumber: req.body.phoneNumber,
//             amount: req.body.amount,
//             accountReference: req.body.reference
//             // privateKeyString is not required anymore
//         });

//         console.log("STK Push Response:", stkPushResponse);

//         if (stkPushResponse && stkPushResponse.status === "SUCCESS") {
//             return res.status(200).json({
//                 message: "Payment initiated successfully",
//                 transactionId: transaction._id
//             });
//         } else {
//             throw new Error(`STK push failed: ${stkPushResponse ? JSON.stringify(stkPushResponse) : 'Unknown error'}`);
//         }

//     } catch (error) {
//         console.error("Transaction Processing Failed:", error);
//         res.status(500).json({
//             message: "Transaction Processing Failed",
//             error: error.message
//         });
//     }
// });

// module.exports = router;

const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

dotenv.config();

const router = express.Router();

const {
    MERCHANT_ACCOUNT_NUMBER,
    MERCHANT_NAME,
    CALLBACK_URL,
} = process.env;

const API_KEY =
  "Y5e2cRT3sQ/4iQg+TO69mY3CZ9QMNM2n8vzKHAsbvNdl9zXYCBItLGcHECjXhrjmxJLp+0pJCNnck8+abpw2RA==";
const MERCHANT_CODE =
  "5685692761";
const CONSUMER_SECRET =
  "9neJ1NL36uN4MGU3fOt4pv834haTCp";

// Import generateSignature function (only once)
const { generateSignature } = require("./signature"); 

// Test Route for Signature Generation (Unused now, but kept here for reference)
router.post('/generate-test-signature', async (req, res) => {
    try {
        const {
            rawText,
            privateKeyString
        } = req.body;
        if (!rawText || !privateKeyString) {
            return res.status(400).json({
                message: "Missing rawText or privateKeyString"
            });
        }

        const generatedSignature = await generateSignature(rawText); // Use generateSignature directly
        console.log("Generated Signature:", generatedSignature);

        res.status(200).json({
            signature: generatedSignature
        });
    } catch (error) {
        console.error("Error generating signature:", error);
        res.status(500).json({
            message: "Error generating signature",
            error: error.message
        });
    }
});


router.get('/access-token', async (req, res) => {
    try {
        const token = await getAccessToken();  // Ensure this function is calling refresh if expired
        res.status(200).json({ accessToken: token });
    } catch (error) {
        res.status(500).json({ error: 'Error generating access token', message: error.message });
    }
});

// async function getAccessToken() {
//     try {
//         const response = await axios.post(
//             "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
//             {
//                 merchantCode: MERCHANT_CODE,
//                 consumerSecret: CONSUMER_SECRET
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Api-Key": API_KEY
//                 }
//             }
//         );
//         console.log("Access Token:", response.data.accessToken);
//         return response.data.accessToken;
//     } catch (error) {
//         console.error("Error getting access token:", error.response ? error.response.data : error.message);
//         throw new Error(`Error getting access token: ${error.message}`);
//     }
// }

let accessToken = null;
let expirationTime = null; // Store expiration time (in milliseconds)
let refreshToken = null;  // You may need to get this from your authentication response

async function refreshAccessToken() {
    try {
        const response = await axios.post(
            "https://uat.finserve.africa/authentication/api/v3/refresh",  // Assuming this is the refresh endpoint
            { refreshToken }, // Pass the refresh token to get a new access token
            {
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": API_KEY
                }
            }
        );
        accessToken = response.data.accessToken;
        expirationTime = new Date().getTime() + (60 * 60 * 1000); // Set expiration to 1 hour from now
        refreshToken = response.data.refreshToken; // Assuming the response also returns a refresh token
        console.log("Access Token Refreshed:", accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error.response ? error.response.data : error.message);
        throw new Error("Error refreshing access token");
    }
}

async function getAccessToken() {
    // If the access token is invalid or expired, refresh it
    if (!accessToken || new Date().getTime() > expirationTime) {
        if (refreshToken) {
            console.log("Access token expired, refreshing...");
            return await refreshAccessToken();
        } else {
            console.log("No refresh token available, generating a new access token...");
            return await generateNewAccessToken();
        }
    }
    return accessToken;
}

async function generateNewAccessToken() {
    try {
        const response = await axios.post(
            "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
            {
                merchantCode: MERCHANT_CODE,
                consumerSecret: CONSUMER_SECRET
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": API_KEY
                }
            }
        );
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken; // Save the refresh token for future use
        expirationTime = new Date().getTime() + (60 * 60 * 1000); // Assuming 1 hour expiration time
        console.log("New Access Token:", accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error generating new access token:", error.response ? error.response.data : error.message);
        throw new Error("Error generating new access token");
    }
}

// Example usage: Use this function to automatically get or refresh the access token
async function callApi() {
    try {
        const token = await getAccessToken();
        // Now you can use this token to make other API calls
        console.log("Using Access Token:", token);
    } catch (error) {
        console.error("Error in API call:", error.message);
    }
}

// Call the API and ensure token is refreshed/valid
callApi();


// Function to generate a random alphanumeric string of a given length
function generateRandomAlphanumeric(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function performSTKPush({ phoneNumber, accountReference }) {
    try {
        // Fixed amount as per your requirement
        const amount = 5.00;

        // Prepare raw text for signature (concatenation)
        const rawText = `${MERCHANT_ACCOUNT_NUMBER}${accountReference}${phoneNumber}Safaricom${amount}KES`;

        // Generate the signature
        const generatedSignature = await generateSignature(rawText); // Await here to get the signature

        // Get the access token (it will auto-refresh if expired)
        const accessToken = await getAccessToken();

        // Get the current date in the required format (YYYY-MM-DD)
        const currentDate = new Date().toISOString().split('T')[0];

        // Make the STK Push API call with hardcoded values
        const stkPushResponseFromAPI = await axios.post(
            'https://uat.finserve.africa/v3-apis/payment-api/v3.0/stkussdpush/initiate',
            {
                merchant: {
                    accountNumber: MERCHANT_ACCOUNT_NUMBER,
                    countryCode: 'KE',
                    name: MERCHANT_NAME
                },
                payment: {
                    ref: accountReference,  // Unique account reference
                    amount: amount.toString(),
                    currency: 'KES',  // Currency is hardcoded
                    telco: 'Safaricom',  // Telco is hardcoded
                    mobileNumber: phoneNumber,  // Dynamic phone number
                    date: currentDate,  // Current date
                    callBackUrl: CALLBACK_URL,  // Callback URL is hardcoded
                    pushType: "USSD"  // Push type is hardcoded
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Use the dynamic access token here
                    'Content-Type': 'application/json',
                    'Signature': generatedSignature  // Use the generated signature
                },
                timeout: 15000
            }
        );

        return stkPushResponseFromAPI.data;
    } catch (error) {
        console.error("STK Push Error:", error.response ? error.response.data : error.message);
        throw new Error(`Error performing STK Push: ${error.message}`);
    }
}


// STK Push Route
router.post('/stk-push', async (req, res) => {
    try {
        // Destructure only the mobileNumber from the request body
        const { mobileNumber } = req.body;

        // Validate that the mobile number is present
        if (!mobileNumber) {
            return res.status(400).json({ message: "Mobile number is required" });
        }

        // Fixed amount of 5.00 (as per your request)
        const amount = 5.00;

        // Generate a unique account reference using a random alphanumeric string
        const reference = generateRandomAlphanumeric(8);  // Generates an alphanumeric reference (8 characters)

        // Default values for other fields (since they're constant)
        const currency = 'KES';
        const telco = 'Safaricom';
        const merchantName = MERCHANT_NAME;
        const merchantAccountNumber = MERCHANT_ACCOUNT_NUMBER;

        // Create a new transaction
        const transaction = new Transaction({
            userId: req.userId || "67a5f218db306cedba9ed66a",  // Replace with actual user ID
            amount,
            currency,
            telco,
            mobileNumber,
            reference,
            merchantName,
            merchantAccountNumber,
            status: "pending"
        });

        // Save the transaction to the database
        await transaction.save();

        // Proceed with the STK Push or any other logic
        const pushResponse = await performSTKPush({
            phoneNumber: mobileNumber,
            accountReference: reference
        });

        res.status(200).json(pushResponse);
    } catch (error) {
        console.error("Error initiating STK push:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get User Details by mobile number
router.get('/user-details/:mobileNumber', async (req, res) => {
    const { mobileNumber } = req.params;

    try {
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
});

// Route to get Transaction Details by user ID or reference
router.get('/transaction-details/:reference', async (req, res) => {
    const { reference } = req.params;

    try {
        const transaction = await Transaction.findOne({ reference });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ message: 'Error fetching transaction details', error: error.message });
    }
});

// Callback route to handle the payment response and update the user subscription
router.post('/payment-callback', async (req, res) => {
    const { mobileNumber } = req.body; // Only mobileNumber will be passed in the callback

    try {
        // Search for a transaction based on mobileNumber and the status
        const transaction = await Transaction.findOne({ mobileNumber, status: { $in: ['pending', 'completed'] } });

        // If no transaction is found, return an error
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found for this mobile number' });
        }

        // You can check if the transaction is pending or completed and handle it accordingly
        if (transaction.status === 'pending') {
            // Update the transaction status to 'completed'
            transaction.status = 'completed';
            transaction.transactionId = 'GeneratedTransactionId'; // Assuming this is generated in your payment system
            transaction.telcoReference = 'GeneratedTelcoReference'; // Generated reference (if applicable)
            transaction.amount = transaction.amount; // Amount from the transaction
            transaction.charge = 1; // This charge can be static or calculated dynamically based on your system
            await transaction.save();
        }

        // Fetch the user based on mobileNumber (assuming each mobile number is linked to a unique user)
        const user = await User.findOne({ mobileNumber }); // Assuming `mobileNumber` exists in the User schema
        if (!user) {
            return res.status(404).json({ message: 'User not found for this mobile number' });
        }

        // Update the user's subscription status
        user.hasSubscribed = true; // User is now subscribed
        await user.save();

        // Return success response
        return res.status(200).json({
            message: 'Transaction successful and user subscription updated',
            status: 'Payment successful',
            mobileNumber,
            debitedAmount: transaction.amount,
            charge: 1
        });
    } catch (error) {
        console.error('Payment Callback Error:', error);
        return res.status(500).json({
            message: 'An error occurred during the payment callback',
            error: error.message
        });
    }
});


module.exports = router;

