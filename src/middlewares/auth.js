const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token is not valid");
        }

        const decodedObj = jwt.verify(token, "DevTinder@4648h");

        const user = await User.findById(decodedObj._id);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

module.exports = { userAuth };
