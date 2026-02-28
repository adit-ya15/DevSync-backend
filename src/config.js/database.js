const mongoose = require("mongoose")

const URL = process.env.MONGO_URI

const connectDb = async() => {
    await mongoose.connect(URL)
}

module.exports = connectDb