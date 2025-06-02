const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const User = mongoose.model('User', userSchema);
User.createIndexes();   
module.exports = User;
