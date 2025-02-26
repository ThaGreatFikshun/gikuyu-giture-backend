// // const mongoose = require('mongoose');

// // const UserSchema = new mongoose.Schema({
// //     username: { type: String, required: true, unique: true },
// //     password: { type: String, required: true },

// //     hasSubscribed: { type: Boolean, default: false }, // Track subscription status
// // });

// // module.exports = mongoose.model('User', UserSchema);
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     mobileNumber: { type: String, required: true, unique: true }, // Ensure mobileNumber exists in the schema
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         validate: {
//             validator: (email) => {
//                 const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//                 return emailRegex.test(email);
//             },
//             message: 'Invalid email address',
//         },
//     },
//     hasSubscribed: { type: Boolean, default: false }, // Track subscription status
// });

// module.exports = mongoose.model('User', UserSchema);
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     mobileNumber: { type: String, required: true, unique: true },
//     hasSubscribed: { type: Boolean, default: false },
//     passwordResetToken: { type: String },
//     passwordResetTokenExpiration: { type: Date },
// });

// module.exports = mongoose.model('User', UserSchema);


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    hasSubscribed: { type: Boolean, default: false },
    passwordResetToken: { type: String },
    passwordResetTokenExpiration: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);

