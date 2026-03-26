const mongoose = require("mongoose")
const config = require("../config/index")

const URL = config.dbUrl

const connectDb = async() => {
    await mongoose.connect(URL)
}

module.exports = connectDb