const mongoose = require('mongoose');
require('dotenv').config();
const dbURI = process.env.DB_URL; 

const conn = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
};

module.exports = conn;