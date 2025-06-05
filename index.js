const conn = require('./db');
const express = require('express');
const app = express();
const bycrypt = require('bcryptjs');
require('dotenv').config();
const cors = require('cors'); // Importing CORS middleware

conn();

app.use(cors({
  origin: 'http://localhost:5173', 
  exposedHeaders: ['Auth-Token']   
}));
app.use(express.json()); // Middleware to parse JSON bodies

const port= process.env.PORT;

app.use('/api/auth', require('./routes/auth'));

app.use('/api/notes', require('./routes/notes'));

// mongodb://localhost:27017/

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}
);