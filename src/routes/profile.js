const express = require("express");
const { userAuth } = require("../middlewares/auth")
const { validateProfileEditData } = require("../utils/validate")
const validator = require("validator")
const bcrypt = require("bcryptjs");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        console.log(user);
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        validateProfileEditData(req.body);

        const user = req.user;

        Object.keys(req.body).forEach((key) => {
            user[key] = req.body[key];
        });

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

profileRouter.post("/profile/password", userAuth,async (req, res) => {
    try {
        const loggesInUser = req.user;

        const { oldPass } = req.body;

        const isOldPassValid = await loggesInUser.validateUser(oldPass);

        if (isOldPassValid) {
            const {newPass} = req.body;
            const isStrongNewPass = await validator.isStrongPassword(newPass);
            if(isStrongNewPass){
                const newPassHash =await  bcrypt.hash(newPass,10);
                loggesInUser.password = newPassHash;

                await loggesInUser.save();
                res.send("Password updated successfully")
            }else{
                throw new Error("Please enter strong password")
            }
        }
        else {
            throw new Error("Please enter correct password")
        }
    } catch (error) {
        res.status(400).send("Err :" + error.message)
    }
})

module.exports = profileRouter;