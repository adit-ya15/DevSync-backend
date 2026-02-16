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
        }).populate("fromUserId","firstName lastName")

        res.json({message : "Request fetched successfully",connectionRequests});
    } catch (error) {
        res.status(400).json({message : error.message});
    }
})


userRouter.get("/user/connections",userAuth,async(req,res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or:[{toUserId : loggedInUser._id},{fromUserId : loggedInUser._id}],
            status : "accepted"
        })
        .populate("fromUserId","firstName lastName age gender")
        .populate("toUserId","firstName lastName age gender")

        const data = connections.map(row => {
            if(row.fromUserId._id.equals(loggedInUser._id)){
                return row.toUserId;
            }
            return row.fromUserId;
        })


        res.json({message : "Connections fetched successfully",data})

    } catch (error) {
        res.status(400).json({message : error.message})
    }

    
})
module.exports = userRouter;