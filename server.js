// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

// // Import routes
// const authRoutes = require('./routes/auth');
// const transactionRoutes = require('./routes/transactions');

// // Use routes
// app.use('/api', authRoutes);
// app.use('/api', transactionRoutes);

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// .then(() => {
//     console.log('MongoDB connected');

//     // Define the User model
//     const User = mongoose.model('User', require('./models/User'));

//     // Update all documents to add the email field
//     User.updateMany({}, { $set: { email: '' } }, (err, result) => {
//         if (err) {
//             console.error('Error updating documents:', err);
//         } else {
//             console.log('Documents updated successfully:', result);
//         }
//     });
// })
// .catch(err => console.log(err));

// // Import routes
// const authRoutes = require('./routes/auth');
// const transactionRoutes = require('./routes/transactions');

// // Use routes
// app.use('/api', authRoutes);
// app.use('/api', transactionRoutes);

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log('MongoDB connected');

    // Import the User model
    const User = require('./models/User');

    // Update all documents to add the email field if needed
    const result = await User.updateMany({ email: { $exists: false } }, { $set: { email: '' } });
    console.log('Update result:', result);
})
.catch(err => console.log(err));


// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

// Use routes
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
