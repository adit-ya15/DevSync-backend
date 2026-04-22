const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const AppError = require("../utils/AppError");

const chatRouter = express.Router();

chatRouter.post("/create/chat", userAuth, async (req, res, next) => {
    try {
        const { participants = [], isGroup = false, name, projectName } = req.body;
        const userId = req.user._id;

        const participantSet = new Set([
            ...participants.map((id) => id.toString()),
            userId.toString()
        ]);

        const participantArray = Array.from(participantSet);

        if (isGroup) {
            if (participantArray.length < 3) {
                return next(new AppError("Group chats require at least 3 participants", 400));
            }
            if (!name || !name.trim()) {
                return next(new AppError("Group chat name is required", 400));
            }

            const chat = await Chat.create({
                participants: participantArray,
                isGroup: true,
                name: name.trim(),
                projectName: projectName ? projectName.trim() : undefined,
                admin: userId
            });

            const populated = await Chat.findById(chat._id)
                .populate("participants", "firstName lastName photoUrl")
                .populate("admin", "firstName lastName photoUrl");

            return res.json(populated);
        }

        if (participantArray.length !== 2) {
            return next(new AppError("Direct chats must have exactly 2 participants", 400));
        }

        const existingChat = await Chat.findOne({
            isGroup: { $ne: true },
            participants: { $all: participantArray, $size: 2 }
        }).populate("lastMessage")
          .populate("participants", "firstName lastName photoUrl");

        if (existingChat) {
            return res.json(existingChat);
        }

        const chat = await Chat.create({
            participants: participantArray
        });

        const populated = await Chat.findById(chat._id)
            .populate("participants", "firstName lastName photoUrl");

        res.json(populated);
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

chatRouter.patch("/rename/:chatId", userAuth, async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { name, projectName } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, isGroup: true, admin: userId });
        if (!chat) return next(new AppError("Chat not found or you are not the admin", 404));

        if (name) chat.name = name;
        if (projectName !== undefined) chat.projectName = projectName;
        
        await chat.save();
        res.json(chat);
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

chatRouter.patch("/add/:chatId", userAuth, async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { participantId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, isGroup: true, admin: userId });
        if (!chat) return next(new AppError("Chat not found or you are not the admin", 404));

        if (!chat.participants.includes(participantId)) {
            chat.participants.push(participantId);
            await chat.save();
        }

        const populated = await Chat.findById(chat._id)
            .populate("participants", "firstName lastName photoUrl")
            .populate("admin", "firstName lastName photoUrl");

        res.json(populated);
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

chatRouter.patch("/remove/:chatId", userAuth, async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { participantId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, isGroup: true, admin: userId });
        if (!chat) return next(new AppError("Chat not found or you are not the admin", 404));

        if (participantId.toString() === userId.toString()) {
            return next(new AppError("Admin cannot remove themselves. Use leave instead.", 400));
        }

        chat.participants = chat.participants.filter(p => p.toString() !== participantId.toString());
        await chat.save();

        const populated = await Chat.findById(chat._id)
            .populate("participants", "firstName lastName photoUrl")
            .populate("admin", "firstName lastName photoUrl");

        res.json(populated);
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

chatRouter.patch("/leave/:chatId", userAuth, async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, isGroup: true, participants: userId });
        if (!chat) return next(new AppError("Chat not found or you are not a participant", 404));

        chat.participants = chat.participants.filter(p => p.toString() !== userId.toString());
        
        if (chat.participants.length === 0) {
            await Chat.findByIdAndDelete(chatId);
            return res.json({ message: "Chat deleted as everyone left." });
        } else if (chat.admin.toString() === userId.toString()) {
            chat.admin = chat.participants[0];
        }

        await chat.save();
        res.json({ message: "Left group chat successfully" });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

module.exports = chatRouter;