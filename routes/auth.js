const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const { username, password, email } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create new user
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            email 
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

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Optional: Store refresh token in database if needed
        user.refreshToken = refreshToken;
        await user.save();

        res.json({ 
            accessToken, 
            refreshToken,
            userId: user._id 
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            message: 'Error logging in',
            error: error.message 
        });
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
