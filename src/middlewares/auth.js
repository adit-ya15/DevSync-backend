const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/index")
const AppError = require("../utils/AppError")

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }

        const decoded = jwt.verify(token, config.auth.jwtSecret);
        const user = await User.findById(decoded._id);

        if (!user) {
            return next(new AppError("User not found", 401));
        }

        req.user = user;
        next();

    } catch (error) {
        return next(error);
    }
};

module.exports = { userAuth };