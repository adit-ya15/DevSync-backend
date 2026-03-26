const cloudinary = require("cloudinary").v2;
const config = require("../config/index")

cloudinary.config({
    cloud_name : config.storage.cloudinaryCloudName,
    api_key : config.storage.cloudinaryApiKey,
    api_secret : config.storage.cloudinaryApiSecret
})

module.exports = cloudinary;