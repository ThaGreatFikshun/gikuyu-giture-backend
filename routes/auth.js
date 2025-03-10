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
// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Transaction = require('../models/Transaction'); // Import the Transaction model
// const crypto = require('crypto');

// const nodemailer = require('nodemailer');

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
//     const { username, password, email, mobileNumber, hasSubscribed } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ 
//             $or: [{ username }, { email }, { mobileNumber }] 
//         });

//         if (existingUser) {
//             return res.status(400).json({ 
//                 message: 'Username, email, or mobile number already exists' 
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUser = new User({ 
//             username, 
//             password: hashedPassword,
//             email,
//             mobileNumber,
//             hasSubscribed: hasSubscribed || false,  // Ensure hasSubscribed is set
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

//         // Get the latest transaction - Modified code
//         const latestTransaction = await Transaction.findOne({ userId: user._id })
//             .sort({ createdAt: -1 }) // Sort by createdAt in descending order
//             .limit(1)             // Limit to 1 result
//             .lean();              // Return a plain JavaScript object

//         // Generate tokens
//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);

//         // Send response with subscription status, mobileNumber and transaction details - Modified Code
//         res.json({
//             accessToken,
//             refreshToken,
//             userId: user._id,
//             hasSubscribed: user.hasSubscribed,
//             mobileNumber: user.mobileNumber,
//             transactionDetails: latestTransaction || null  // Include transaction details, or null if none found
//         });
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({
//             message: 'Error logging in',
//             error: error.message
//         });
//     }
// });

// // Nodemailer configuration
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: process.env.SMTP_USERNAME,
//         pass: process.env.SMTP_PASSWORD,
//     },
// });

// // Forgot Password
// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;

//     if (!email || email.trim() === '') {
//         return res.status(400).json({ message: 'Email is required' });
//     }

//     try {
//         // Find user by email
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found with this email' });
//         }

//         // Generate a password reset token
//         const passwordResetToken = crypto.randomBytes(32).toString('hex');
//         user.passwordResetToken = passwordResetToken;
//         user.passwordResetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
//         await user.save();

//         // Send the password reset link to the user's email address
//         const mailOptions = {
//             from: process.env.SMTP_USERNAME,
//             to: user.email,
//             subject: 'Password Reset',
//             text: `Please reset your password by clicking this link: https://your-app-url.com/reset-password/${passwordResetToken}`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 return res.status(500).json({ message: 'Error sending password reset link', error: error.message });
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 res.status(200).json({ message: 'Password reset link sent to your registered email' });
//             }
//         });
//     } catch (error) {
//         console.error('Forgot Password Error:', error);
//         res.status(500).json({ message: 'Error sending password reset link', error: error.message });
//     }
// });

// // Reset Password
// router.post('/reset-password', async (req, res) => {
//     const { passwordResetToken, newPassword } = req.body;

//     if (!passwordResetToken || passwordResetToken.trim() === '') {
//         return res.status(400).json({ message: 'Password reset token is required' });
//     }

//     if (!newPassword || newPassword.trim() === '') {
//         return res.status(400).json({ message: 'New password is required' });
//     }

//     try {
//         // Find user by password reset token
//         const user = await User.findOne({
//             passwordResetToken: passwordResetToken,
//             passwordResetTokenExpiration: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired password reset token' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);
//         // Update the user's password
//         user.password = hashedPassword;
//         user.passwordResetToken = null;
//         user.passwordResetTokenExpiration = null;
//         await user.save();

//         res.status(200).json({ message: 'Password reset successfully' });
//     } catch (error) {
//         console.error('Reset Password Error:', error);
//         res.status(500).json({ message: 'Error resetting password', error: error.message });
//     }
// });


// // logout Logic
// router.post('/logout', async (req, res) => {
//     const { userId } = req.body;

//     try {
//         // Find user
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Clear the refresh token
//         user.refreshToken = null;
//         await user.save();

//         res.status(200).json({ message: 'Logged out successfully' });
//     } catch (error) {
//         console.error('Logout Error:', error);
//         res.status(500).json({ message: 'Error logging out', error: error.message });
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



// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Transaction = require('../models/Transaction'); // Import the Transaction model
// const crypto = require('crypto');
// const nodemailer = require('nodemailer'); // Import Nodemailer

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

// // Nodemailer configuration
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: 'your-email@gmail.com', // Your email address
//         pass: 'your-email-password', // Your email password or an application-specific password
//     },
// });

// // Register User
// router.post('/register', async (req, res) => {
//     const { username, password, email, mobileNumber, hasSubscribed } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ 
//             $or: [{ username }, { email }, { mobileNumber }] 
//         });

//         if (existingUser) {
//             return res.status(400).json({ 
//                 message: 'Username, email, or mobile number already exists' 
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         // Create new user
//         const newUser = new User({ 
//             username, 
//             password: hashedPassword,
//             email,
//             mobileNumber,
//             hasSubscribed: hasSubscribed || false,  // Ensure hasSubscribed is set
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

//         // Get the latest transaction - Modified code
//         const latestTransaction = await Transaction.findOne({ userId: user._id })
//             .sort({ createdAt: -1 }) // Sort by createdAt in descending order
//             .limit(1)             // Limit to 1 result
//             .lean();              // Return a plain JavaScript object

//         // Generate tokens
//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);

//         // Send response with subscription status, mobileNumber and transaction details - Modified Code
//         res.json({
//             accessToken,
//             refreshToken,
//             userId: user._id,
//             hasSubscribed: user.hasSubscribed,
//             mobileNumber: user.mobileNumber,
//             transactionDetails: latestTransaction || null  // Include transaction details, or null if none found
//         });
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({
//             message: 'Error logging in',
//             error: error.message
//         });
//     }
// });

// // Forgot Username
// router.post('/forgot-username', async (req, res) => {
//     const { mobileNumber } = req.body;

//     if (!mobileNumber || mobileNumber.trim() === '') {
//         return res.status(400).json({ message: 'Mobile number is required' });
//     }

//     try {
//         // Find user by mobile number
//         const user = await User.findOne({ mobileNumber });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found with this mobile number' });
//         }

//         // Send the username to the user's email address
//         const mailOptions = {
//             from: process.env.SMTP_USERNAME, // Use environment variable for sender email
//             to: user.email,
//             subject: 'Your Username',
//             text: `Your username is: ${user.username}`,
//         };

//         const { sendEmail } = require('../nodemailer');
//         const result = await sendEmail(mailOptions);

//         if (result) {
//             res.status(200).json({ message: 'Username sent to your registered email' });
//         } else {
//             res.status(500).json({ message: 'Error sending username' });
//         }
//     } catch (error) {
//         console.error('Forgot Username Error:', error);
//         res.status(500).json({ message: 'Error sending username', error: error.message });
//     }
// });


// // Forgot Password
// router.post('/forgot-password', async (req, res) => {
//     const { mobileNumber } = req.body;

//     if (!mobileNumber || mobileNumber.trim() === '') {
//         return res.status(400).json({ message: 'Mobile number is required' });
//     }

//     try {
//         // Find user by mobile number
//         const user = await User.findOne({ mobileNumber });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found with this mobile number' });
//         }

//         // Generate a password reset token
//         const passwordResetToken = crypto.randomBytes(32).toString('hex');
//         user.passwordResetToken = passwordResetToken;
//         user.passwordResetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
//         await user.save();

//         // Send the password reset link to the user's email address
//         const mailOptions = {
//             from: process.env.SMTP_USERNAME, // Your email address
//             to: user.email,
//             subject: 'Password Reset',
//             text: `Please reset your password by clicking this link: https://your-app-url.com/reset-password/${passwordResetToken}`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 return res.status(500).json({ message: 'Error sending password reset link', error: error.message });
//             } else {
//                 console.log('Email sent: ' + info.response);
//                 res.status(200).json({ message: 'Password reset link sent to your registered email' });
//             }
//         });
//     } catch (error) {
//         console.error('Forgot Password Error:', error);
//         res.status(500).json({ message: 'Error sending password reset link', error: error.message });
//     }
// });

// // Reset Password
// router.post('/reset-password', async (req, res) => {
//     const { passwordResetToken, newPassword } = req.body;

//     if (!passwordResetToken || passwordResetToken.trim() === '') {
//         return res.status(400).json({ message: 'Password reset token is required' });
//     }

//     if (!newPassword || newPassword.trim() === '') {
//         return res.status(400).json({ message: 'New password is required' });
//     }

//     try {
//         // Find user by password reset token
//         const user = await User.findOne({
//             passwordResetToken: req.body.passwordResetToken,
//             passwordResetTokenExpiration: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired password reset token' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 12);
//         // Update the user's password
//         user.password = hashedPassword;
//         user.passwordResetToken = null;
//         user.passwordResetTokenExpiration = null;
//         await user.save();

//         res.status(200).json({ message: 'Password reset successfully' });
//     } catch (error) {
//         console.error('Reset Password Error:', error);
//         res.status(500).json({ message: 'Error resetting password', error: error.message });
//     }
// });

// // logout Logic
// router.post('/logout', async (req, res) => {
//     const { userId } = req.body;

//     try {
//         // Find user
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Clear the refresh token
//         user.refreshToken = null;
//         await user.save();

//         res.status(200).json({ message: 'Logged out successfully' });
//     } catch (error) {
//         console.error('Logout Error:', error);
//         res.status(500).json({ message: 'Error logging out', error: error.message });
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


// Updated user auth

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // Import the Transaction model
const crypto = require('crypto');

const nodemailer = require('nodemailer'); // Import Nodemailer

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

// Forgot Username
router.post('/forgot-username', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.trim() === '') {
        return res.status(400).json({ message: 'Mobile number is required' });
    }

    try {
        // Find user by mobile number
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this mobile number' });
        }

        // Import the sendEmail function from the nodemailer.js file
        const { sendEmail } = require('../nodemailer');

        // Send the username to the user's email address
        const mailOptions = {
            from: process.env.SMTP_USERNAME, // Use environment variable for sender email
            to: user.email,
            subject: 'Your Username',
            text: `Your username is: ${user.username}`,
        };

        try {
          await sendEmail(mailOptions); // Use the sendEmail function
            res.status(200).json({ message: 'Username sent to your registered email' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending username', error: error.message });
        }
    } catch (error) {
        console.error('Forgot Username Error:', error);
        res.status(500).json({ message: 'Error sending username', error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.trim() === '') {
        return res.status(400).json({ message: 'Mobile number is required' });
    }

    try {
        // Find user by mobile number
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this mobile number' });
        }

        // Generate a password reset token
        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = passwordResetToken;
        user.passwordResetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

          const { sendEmail } = require('../nodemailer');
        // Send the password reset link to the user's email address
        const mailOptions = {
            from: process.env.SMTP_USERNAME, // Use environment variable for sender email
            to: user.email,
            subject: 'Password Reset',
            text: `Please reset your password by clicking this link: https://kikuyu-dictionary.onrender.com/#/reset-password?token=\${passwordResetToken}\``,
        };

        // Send the email
        try {
            await sendEmail(mailOptions);
            res.status(200).json({ message: 'Password reset link sent to your registered email' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending password reset link', error: error.message });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Error sending password reset link', error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { passwordResetToken, newPassword } = req.body;

    if (!passwordResetToken || passwordResetToken.trim() === '') {
        return res.status(400).json({ message: 'Password reset token is required' });
    }

    if (!newPassword || newPassword.trim() === '') {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        // Find user by password reset token
        const user = await User.findOne({
            passwordResetToken: req.body.passwordResetToken,
            passwordResetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        // Update the user's password
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpiration = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password', error: error.message });
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
