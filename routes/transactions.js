const express = require('express');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.id;
        next();
    });
}

// Record Transaction from Dart app
router.post('/transactions', authenticateToken, async (req, res) => {
    const { userId, amount, currency, telco, mobileNumber, date, reference, merchantName } = req.body; 

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
        console.error(error); 
        res.status(500).json({ message: 'Error recording transaction' });
    }
});

// Get Transactions for User
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

module.exports = router;
