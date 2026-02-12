const express = require("express");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {

    try {
        //validate step
        validateSignup(req);

        //encrypting the password
        const { firstName, lastName, age, gender, email, password } = req.body
        const passwordHash = await bcrypt.hash(password, 10)

        const user = new User({
            firstName,
            lastName,
            age,
            gender,
            email,
            password: passwordHash
        })


        await user.save()
        res.send("User saved successfully")
    } catch (error) {
        res.status(400).send(error.message)
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        if (validator.isEmail(email)) {
            const user = await User.findOne({ email: email });
            if (user) {
                const pass = user.password;
                const isValidPass = user.validatePassword(password);

                if (isValidPass) {
                    const token = user.getJWT();
                    res.cookie("token", token);
                    res.send("login successful")
                } else {
                    res.send("invalid credentials")
                }
            } else {
                res.send("User not found")
            }
        } else {
            res.status(400).send("Invalid Email")
        }

    } catch (error) {
        console.log("Invalid Credentials", error)
        res.send("Invalid credentials")
    }
})

module.exports = authRouter;