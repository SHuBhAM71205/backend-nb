const express = require('express');
const User = require('../models/User');
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_secret = process.env.JWT_SECRET;


const fetchuser = require('../middleware/fetchuser');
// Route to create a new user
router.post('/createuser',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],// Validate the request body
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hashedPassword; // Hash the password before saving
        const user = new User(req.body);


        user.save().then(() => {
            jwt.sign(
                { user: { id: user._id } }, // Payload
                JWT_secret, // Secret key
                (err, token) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error generating token', error: err.message });
                    }
                    res.header('auth-token', token); // Set the token in the response header
                }
            );
            res.status(201).json(
                {
                    message: 'User created successfully',
                    user: user
                }
            );
        }).catch(err => {
            res.status(400).json(
                {
                    message: 'Error creating user',
                    error: err.message
                }
            );
        });
    });

router.post('/login',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        User.findOne({ email }).then(user => {
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            jwt.sign(
                { user: { id: user._id } }, // Payload
                JWT_secret, // Secret key
                (err, token) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error generating token', error: err.message });
                    }
                    res.header('auth-token', token); // Set the token in the response header
                    res.status(200).json(
                        {
                            message: 'Login successful',
                            user: user,
                        }
                    );
                }
            );
        }).catch(err => {
            res.status(500).json(
                {
                    message: 'Error logging in',
                    error: err.message
                }
            );
        });
    }
);



// get user detail

router.post('/getuser', fetchuser,async (req, res) => {
    try {

        const id= req.user.id;
         // Get the user ID from the request object
        const user=await User.findById(id).select("-password");
        res.status(200).json({
            message: 'User details fetched successfully',
            user: user
        });

    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})
module.exports = router;
