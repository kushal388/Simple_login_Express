const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    age:Number,
    email:String,
    password:String,
    loginAttempts: {type :Number ,default : 0},
    blockUntil:Date
});

module.exports = mongoose.model('User', userSchema)