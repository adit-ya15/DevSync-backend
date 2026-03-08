const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    orderId : {
        type : String,
        required : true
    },
    paymentId : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true,
    },
    amount : {
        type : Number,
        required : true,
    },
    currency : {
        type :String,
        required : true,
    },
    receipt : {
        type : String,
        required : true,
    },
    notes : {
        firstName : {
            type : String
        },
        lastName : {
            type : String
        },
        membershipType : {
            type  :String
        }
    }
})

module.exports = mongoose.model("Payment",paymentSchema);