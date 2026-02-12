const express = require("express");

const app = express()
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
app.use(express.json())
app.use(cookieParser())

const connectDb = require("./config.js/database")
const User = require("./models/user")
const validateSignup = require("./utils/validate")
const validator = require("validator")
const {userAuth} = require("./middlewares/auth")

connectDb()
    .then(() => {
        console.log("Database connection successful")
        app.listen("9999", () => {
            console.log("Server listens on the port 9999");
        });
    })
    .catch((error) => console.log("database cannot be connected",error))



app.delete("/user", async (req, res) => {
    const userId = req.body.userId;

    try {
        await User.findByIdAndDelete(userId)
        res.send("User deleted successfully")
    } catch (error) {
        console.log("User not deleted", error)
        res.status(400).send("User not deleted")
    }
})

app.patch("/user", async (req, res) => {

    const data = req.body
    const userId = req.body.userId
    try {
        const allowedUpdates = ["firstName", "lastName", "userId", "age"];
        const isUpdateAllowed = Object.keys(data).every((k) => allowedUpdates.includes(k));
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed")
        }
        await User.findByIdAndUpdate({ _id: userId }, data)
        res.send("User updated successfully")
    } catch (error) {
        console.log(error)
        res.status(400).send("User not updated")
    }
})





app.post("/sendConnectionRequest",userAuth,async(req,res) =>{
    const user = req.user;
    res.send(user.firstName+" Connection request send")
})

/*Some important notes
Version number : 4.19.18;
Here 4 represnts = Major
     19 represnts = Minor
     18 represents = Patch

PATCH : means the bug fixes or some interal changes which not break the previous version
MINOR : means the minor changes like adding the new features that are backward compatible
MAJOR : means the major changes in the dependency it may break the previos version

The version should follow the semver
Semantic Versioning is a standard for version numbers using MAJOR.MINOR.PATCH where patch
releases contain bug fixes, minor releases add backward-compatible features, and major releases 
introduce breaking changes.

WHAT DOES ^ AND ~ MEANS IN THE VERSION NUMBER?
    ^ : This is called caret. Caret allows updates do not break the major version.
    ~ : This symbol is called tilda. This will only allows the patch changes;

    But if the version start with 0;
    then npm consider library as unstable library.
    So it think even the minor updates will break the library.
    That's in these case ^ it means it alows only the patch updates.
*/
