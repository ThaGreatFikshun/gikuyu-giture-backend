// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const router = express.Router();

// // Validate JWT Secret
// const validateJWTSecret = () => {
//     const secret = process.env.JWT_SECRET;
//     if (!secret || secret === 'your_jwt_secret') {
//         console.warn('WARNING: Using default or weak JWT secret. Please set a strong, unique secret in your .env file.');
//     }
//     return secret || crypto.randomBytes(64).toString('hex');
// };

// // Generate Access Token
// const generateAccessToken = (user) => {
//     const JWT_SECRET = validateJWTSecret();
//     return jwt.sign(
//         { 
//             id: user._id, 
//             username: user.username 
//         }, 
//         JWT_SECRET, 
//         { 
//             expiresIn: '1h',
//             algorithm: 'HS256' 
//         }
//     );
// };

// // Generate Refresh Token
// const generateRefreshToken = (user) => {
//     const JWT_SECRET = validateJWTSecret();
//     return jwt.sign(
//         { 
//             id: user._id, 
//             username: user.username 
//         }, 
//         JWT_SECRET, 
//         { 
//             expiresIn: '7d',
//             algorithm: 'HS256' 
//         }
//     );
// };

// // Register User
// router.post('/register', async (req, res) => {
//     const { username, password, email } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ 
//             $or: [{ username }, { email }] 
//         });

//         if (existingUser) {
//             return res.status(400).json({ 
//                 message: 'Username or email already exists' 
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);
        
//         // Create new user
//         const newUser = new User({ 
//             username, 
//             password: hashedPassword,
//             email 
//         });

//         await newUser.save();

//         res.status(201).json({ 
//             message: 'User registered successfully',
//             userId: newUser._id 
//         });
//     } catch (error) {
//         console.error('Registration Error:', error);
//         res.status(500).json({ 
//             message: 'Error registering user',
//             error: error.message 
//         });
//     }
// });

// // Login User
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Find user
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ 
//                 message: 'User not found' 
//             });
//         }

//         // Validate password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // Generate tokens
//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);

//         // Optional: Store refresh token in database if needed
//         user.refreshToken = refreshToken;
//         await user.save();

//         res.json({ 
//             accessToken, 
//             refreshToken,
//             userId: user._id 
//         });
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({ 
//             message: 'Error logging in',
//             error: error.message 
//         });
//     }
// });

// // Refresh Token
// router.post('/refresh-token', async (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//         return res.status(401).json({ 
//             message: 'Refresh token required' 
//         });
//     }

//     try {
//         const JWT_SECRET = validateJWTSecret();
//         const decoded = jwt.verify(refreshToken, JWT_SECRET);

//         // Find user
//         const user = await User.findById(decoded.id);
//         if (!user || user.refreshToken !== refreshToken) {
//             return res.status(403).json({ 
//                 message: 'Invalid refresh token' 
//             });
//         }

//         // Generate new access token
//         const newAccessToken = generateAccessToken(user);

//         res.json({ 
//             accessToken: newAccessToken 
//         });
//     } catch (error) {
//         res.status(403).json({ 
//             message: 'Invalid refresh token',
//             error: error.message 
//         });
//     }
// });

// module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // Import the Transaction model
const crypto = require('crypto');

const router = express.Router();

// Validate JWT Secret
const validateJWTSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your_jwt_secret') {
        console.warn('WARNING: Using default or weak JWT secret. Please set a strong, unique secret in your .env file.');
    }
    return secret || crypto.randomBytes(64).toString('hex');
};

// Generate Access Token
const generateAccessToken = (user) => {
    const JWT_SECRET = validateJWTSecret();
    return jwt.sign(
        { 
            id: user._id, 
            username: user.username 
        }, 
        JWT_SECRET, 
        { 
            expiresIn: '1h',
            algorithm: 'HS256' 
        }
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    const JWT_SECRET = validateJWTSecret();
    return jwt.sign(
        { 
            id: user._id, 
            username: user.username 
        }, 
        JWT_SECRET, 
        { 
            expiresIn: '7d',
            algorithm: 'HS256' 
        }
    );
};

// Register User
router.post('/register', async (req, res) => {
    const { username, password, email, mobileNumber, hasSubscribed } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }, { mobileNumber }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username, email, or mobile number already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            email,
            mobileNumber,
            hasSubscribed: hasSubscribed || false,  // Ensure hasSubscribed is set
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: newUser._id 
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ 
            message: 'Error registering user',
            error: error.message 
        });
    }
});

// Login User
// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;

//     try {
//         // Find user
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(404).json({ 
//                 message: 'User not found' 
//             });
//         }

//         // Validate password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ 
//                 message: 'Invalid credentials' 
//             });
//         }

//         // Generate tokens
//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);

//         // Optional: Store refresh token in database if needed
//         user.refreshToken = refreshToken;
//         await user.save();

//         // Send response with subscription status
//         res.json({ 
//             accessToken, 
//             refreshToken,
//             userId: user._id,
//             hasSubscribed: user.hasSubscribed  // Include the subscription status
//         });
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({ 
//             message: 'Error logging in',
//             error: error.message 
//         });
//     }
// });

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Get the latest transaction - Modified code
        const latestTransaction = await Transaction.findOne({ userId: user._id })
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .limit(1)             // Limit to 1 result
            .lean();              // Return a plain JavaScript object

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Send response with subscription status, mobileNumber and transaction details - Modified Code
        res.json({
            accessToken,
            refreshToken,
            userId: user._id,
            hasSubscribed: user.hasSubscribed,
            mobileNumber: user.mobileNumber,
            transactionDetails: latestTransaction || null  // Include transaction details, or null if none found
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            message: 'Error logging in',
            error: error.message
        });
    }
});

// logout Logic
router.post('/logout', async (req, res) => {
    const { userId } = req.body;

    try {
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear the refresh token
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
});
// Refresh Token
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ 
            message: 'Refresh token required' 
        });
    }

    try {
        const JWT_SECRET = validateJWTSecret();
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ 
                message: 'Invalid refresh token' 
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        res.json({ 
            accessToken: newAccessToken 
        });
    } catch (error) {
        res.status(403).json({ 
            message: 'Invalid refresh token',
            error: error.message 
        });
    }
});

module.exports = router;
