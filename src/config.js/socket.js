const socket = require("socket.io");
const Chat = require("../models/chat");
const jwt = require("jsonwebtoken");
const Message = require("../models/message");

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = user;
        } catch (error) {
            next(new Error("Authentication error"))
        }
    })

    io.on("connection", (socket) => {
        socket.on("joinChat", (chatId) => {
            socket.join(chatId);
        })
        socket.on("sendMessage", async ({ chatId, text }) => {
            try {
                const userId = socket.user._id;
                const chat = await Chat.findById(chatId);

                if (!chat) {
                    return;
                }

                if (!chat.participants.includes(userId)) return;

                const message = await Message.create({
                    chatId,
                    senderId: userId,
                    text
                })

                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: message._id
                })

                io.to(chatId).emit("messageReceived", message);
            } catch (error) {
                console.log(error.message)
            }
        })
        socket.on("typing", (chatId) => {
            socket.to(chatId).emit("typing", {
                userId: socket.user._id
            });
        });
        socket.on("stopTyping", (chatId) => {
            socket.to(chatId).emit("stopTyping", {
                userId: socket.user._id
            });
        });

        socket.on("markSeen", async ({ chatId }) => {
            const userId = socket.user._id;

            await Message.updateMany(
                {
                    chatId,
                    readBy: { $ne: userId }
                },
                {
                    $addToSet: { readBy: userId }
                }
            );

            io.to(chatId).emit("messagesSeen", {
                userId
            });
        });
        socket.on("disconnect", () => { })
    })
}



module.exports = initializeSocket;