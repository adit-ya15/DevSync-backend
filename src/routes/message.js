const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const Message = require("../models/message");

const express = require("express");

const messageRouter = express.Router();

messageRouter.get("/messages/:chatId", userAuth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, participants: userId });
        if (!chat) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const messages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

messageRouter.post("/send/message", userAuth, async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const senderId = req.user._id;

        if (!chatId) {
            return res.status(400).json({ message: "chatId is required" });
        }
        if (!text) {
            return res.status(400).json({ message: "Message is required" });
        }

        const chat = await Chat.findOne({ _id: chatId, participants: senderId });
        if (!chat) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const message = await Message.create({
            chatId,
            senderId,
            text
        });

        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message._id
        });

        res.json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

messageRouter.put("/edit/message/:messageId", userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Message is required" });
        }

        const message = await Message.findOneAndUpdate(
            { _id: messageId, senderId: userId, isDeleted: false },
            { text, isEdited: true },
            { new: true }
        );

        if (!message) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

messageRouter.delete("/delete/message/:messageId", userAuth, async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findOneAndUpdate(
            { _id: messageId, senderId: req.user._id },
            { text: "", isDeleted: true },
            { new: true }
        );

        if (!message) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json({ message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = messageRouter;

