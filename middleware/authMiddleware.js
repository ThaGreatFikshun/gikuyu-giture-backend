const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model if you need it

// Auth middleware to extract userId from JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        // Replace 'process.env.JWT_SECRET' with the actual JWT secret from your environment
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;  // Set userId from the token payload

        next();  // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Authorization Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
