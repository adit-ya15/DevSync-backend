const express = require("express");
const bcrypt = require("bcryptjs");
const { validateSignup } = require("../utils/validate");
const User = require("../models/user");
const validator = require("validator");



const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignup(req.body);

        const { firstName, lastName, email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: passwordHash,
        });

        await user.save();

        const token = user.getJWT();

        res
            .status(201)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({ message: "User created successfully" });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }

        res.status(400).json({ message: error.message });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!password) {
            return res.status(400).json({ message: "Password required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValid = await user.validateUser(password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = user.getJWT();

        res
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({
                id: user._id,
                firstName: user.firstName,
                email: user.email,
            });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

authRouter.post("/logout", (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0)
    })

    res.send("Logut Successfully")
})

module.exports = authRouter;