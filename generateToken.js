const crypto = require('crypto');
const axios = require('axios');

const API_KEY = "Y5e2cRT3sQ/4iQg+TO69mY3CZ9QMNM2n8vzKHAsbvNdl9zXYCBItLGcHECjXhrjmxJLp+0pJCNnck8+abpw2RA==";
const MERCHANT_CODE = "5685692761";
const CONSUMER_SECRET = "9neJ1NL36uN4MGU3fOt4pv834haTCp";
    
async function getAccessToken() {
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

        console.log("Access Token:", response.data.accessToken);
        return response.data.accessToken;
    } catch (error) {
        console.error("Error getting token:", error.response.data);
    }
}

getAccessToken();

