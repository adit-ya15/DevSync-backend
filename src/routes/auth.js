const express = require("express");
const bcrypt = require("bcryptjs");
const { validateSignup } = require("../utils/validate");
const User = require("../models/user");
const validator = require("validator");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

        const savedUser = await user.save();

        const token = savedUser.getJWT();

        res
            .status(201)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({ message: "User created successfully", data: savedUser });

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

authRouter.post("/auth/google/callback", async (req, res) => {
    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const { email, given_name, family_name, sub: googleId, picture } = ticket.getPayload();

        let user = await User.findOne({ email: email });

        if (!user) {
            user = new User({
                firstName: given_name,
                lastName: family_name,
                email: email,
                googleId: googleId,
                photoUrl: picture,
            })
            await user.save();

        }

        const token = await user.getJWT();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .json({
                message: "Login Successfully",
                data: user
            })
    } catch (error) {
        res.status(400).json({ message: "Invalid Google Token" })
    }
})

authRouter.get("/auth/github", (req, res) => {
    const githubAuthURL =
        `https://github.com/login/oauth/authorize?` +
        `client_id=${process.env.GITHUB_CLIENT_ID}&` +
        `scope=user:email`;

    res.redirect(githubAuthURL);
})

authRouter.get("/auth/github/callback", async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: "Code not provides" })
        }

        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: "application/json" },
            }
        )

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const emailResponse = await axios.get("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const primaryEmail = emailResponse.data.find(
            (email) => email.primary && email.verified
        )?.email;

        if (!primaryEmail) {
            return res.status(400).json({ message: "No verified email found" })
        }

        let user = await User.findOne({ email: primaryEmail })

        if (!user) {
            user = new User({
                email: primaryEmail,
                firstName: userResponse.data.name || userResponse.data.login,
                lastName: "",
                githubId: userResponse.data.id,
                photoUrl: userResponse.data.avatar_url,
            })
            await user.save();
        }

        const token = await user.getJWT();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .redirect("https://devsyncapp.in")

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "GitHub authentication failed" });
    }
})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0)
    })

    res.send("Logut Successfully")
})

module.exports = authRouter;