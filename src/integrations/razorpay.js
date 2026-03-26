const Razorpay = require("razorpay");
const config = require("../config/index")

var instance = new Razorpay({
    key_id : config.finance.razorpayKeyId,
    key_secret : config.finance.razorpayKeySecret
})

module.exports = instance;