const express = require("express");
const { userAuth } = require("../middlewares/auth");
const instance = require("../config.js/razorpay");
const paymentRouter = express.Router();
const membershipType = require("../costants");
const Payment = require("../models/Payment");
const {validateWebhookSignature} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

paymentRouter.post("/payment/create",userAuth,async(req,res) => {
    try {
        const {membershipType} = req.body;
        const {firstName,lastName,email} = req.user;

        const order = await instance.orders.create({
            amount : membershipType[membershipType],
            currency : "INR",
            receipt : "receipt#1",
            notes : {
                firstName,
                lastName,
                email,
                membershipType
            }
        });
        const Payment = new Payment({
            userId : req.user._id,
            orderId : order.id,
            status : order.status,
            amount : order.amount,
            currency : order.currency,
            receipt : order.receipt,
            notes : order.notes
        })

        const savedPayment = await Payment.save();

        res.json({...savedPayment.toJSON()},process.env.RAZORPAY_KEYID)
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

paymentRouter.post("/payment/webhook",async(req,res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-signature");

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if(!isWebhookValid){
            return res.status(400).json({message : "Webhook signature is invalid"});
        }

        const paymentDetails = req.body.payload.payment.entity;

        const payment = await Payment.findOne(({orderId : paymentDetails.orderId}));
        payment.status = paymentDetails.status;

        await payment.save();

        const user = await User.findOne({_id : payment.userId});
        user.isPremium = true;
        await User.save();

        return res.status(200).json(({message:"Webhook received successfully"}));

    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

paymentRouter.get("/premium/verify",async(req,res) => {
    const user = req.user.toJSON();
    if(user.isPremium){
        return res.json({isPremium : true});
    }
    return res.json({isPremium : false});
})

module.exports = paymentRouter;