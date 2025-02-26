const mongoose = require('mongoose');

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
mongoose.set("strictQuery", false);

// Define the database URL to connect to
const mongoDB = 'mongodb+srv://db_admin:55yc5TIwt96FI5bQ@cluster0.jo61f.mongodb.net/ggdb?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Export the connection
module.exports = mongoose;
