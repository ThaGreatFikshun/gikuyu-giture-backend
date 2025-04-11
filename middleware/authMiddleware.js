const jwt = require('jsonwebtoken');

// Auth middleware to extract userId from JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET;  // Get JWT secret from environment (make sure .env is loaded)

        // Ensure that 'HS256' is the correct algorithm used for signing tokens
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }); 

        req.userId = decoded.id;  // Set userId from the token payload

        next();  // Continue to the next middleware or route handler
    } catch (error) {
        console.error('Authorization Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
