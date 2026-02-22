const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // important
        },
        photoUrl: {
            type: String,
            default: "/images/default-avatar.png",
        },
        age: {
            type: Number,
            min: 18,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
    },
    { timestamps: true }
);

// JWT
userSchema.methods.getJWT = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Password compare
userSchema.methods.validateUser = async function (passwordInput) {
    return await bcrypt.compare(passwordInput, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;