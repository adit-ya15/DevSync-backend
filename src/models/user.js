const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName :{ 
        type : String
    },
    lastName : {
        type : String
    },
    age : {
        type : Number
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    gender : {
        type : String,
        validate(value){
            if(!["male","female","other"].includes(value.toLowerCase())){
                throw new Error("Please enter a valid gender")
            }
        }
    }
},{timestamps : true})

const User = mongoose.model("User",userSchema)

module.exports = User