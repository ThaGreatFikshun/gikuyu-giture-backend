// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     hasSubscribed: { type: Boolean, default: false }, // Track subscription status
// });

// module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true }, // Ensure mobileNumber exists in the schema
    hasSubscribed: { type: Boolean, default: false }, // Track subscription status
});

module.exports = mongoose.model('User', UserSchema);
