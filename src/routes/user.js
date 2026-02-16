const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const userRouter = express.Router();

userRouter.get("/user/request/received",userAuth,async(req,res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status : "interested"
        })

        res.json({message : "Request fetched successfully",connectionRequests});
    } catch (error) {
        res.status(400).json({message : error.message});
    }
})

module.exports = userRouter;