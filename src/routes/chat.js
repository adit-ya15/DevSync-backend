const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const AppError = require("../utils/AppError");

const chatRouter = express.Router();

chatRouter.post("/create/chat", userAuth, async (req, res, next) => {
    try {
        const { participants = [] } = req.body;
        const userId = req.user._id;

        const participantSet = new Set([
            ...participants.map((id) => id.toString()),
            userId.toString()
        ]);

        const chat = await Chat.create({
            participants: Array.from(participantSet)
        });

        res.json(chat);
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

chatRouter.get("/get/chats", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({
            participants: userId
        })
            .populate("lastMessage")
            .populate("participants", "firstName lastName photoUrl");

        res.json(chats);
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

module.exports = chatRouter;