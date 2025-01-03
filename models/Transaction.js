const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // Currency type
    telco: { type: String, required: true }, // Payer's telco provider
    mobileNumber: { type: String, required: true }, // Payer's mobile number
    date: { type: Date, default: Date.now }, // Transaction date
    reference: { type: String, required: true }, // Payment reference
    merchantName: { type: String, required: true }, // Merchant name
});

module.exports = mongoose.model('Transaction', TransactionSchema);
