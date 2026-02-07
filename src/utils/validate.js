const validator = require("validator")
const validateSignup = (req) => {
    const {firstName, lastName, age, gender, email,password} = req.body

    if(!firstName || !lastName || !age || !gender || !email || !password){
        throw new Error("Please fill all the fields")
    }
    else if ( !validator.isEmail(email)){
        throw new Error("please enter a valid email")
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter the strong password")
    }
}

module.exports = validateSignup;