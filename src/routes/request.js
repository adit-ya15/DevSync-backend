const express = require("express");
const {userAuth} = require("../middlewares/auth")
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res) =>{
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["interested","ignored"];

        if(!allowedStatus.includes(status.toLowerCase())){
            return res.status(400).json({message : `${status} is not allowed here`})
        }

        const isValidToUser = User.findOne({toUserId});

        if(!isValidToUser){
            return res.status(400).json({message : "User not found"})
        }

        const existedRequest = ConnectionRequest.findOne({
            $or: [
                {fromUserId,toUserId},
                {fromUserId : toUserId, toUserId : fromUserId}
            ]
        })

        if(existedRequest) {
            return res.status(400).json({message : `Request already exist`})
        }

        const request = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        })

        await request.save();
        res.status(200).send("Connection request send successfully")

    } catch (error) {
        res.status(400).send("Err : " + error.message)
    }
})


module.exports = requestRouter;