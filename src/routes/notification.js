const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Notification = require("../models/notification");
const AppError = require("../utils/AppError");

const notificationRouter = express.Router();

notificationRouter.get("/notifications", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 20, 50);

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("sender", "firstName lastName photoUrl"),
            Notification.countDocuments({ recipient: userId }),
            Notification.countDocuments({ recipient: userId, isRead: false })
        ]);

        res.json({
            notifications,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

notificationRouter.patch("/notifications/:id/read", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return next(new AppError("Notification not found", 404));
        }

        res.json({ notification });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

notificationRouter.patch("/notifications/read-all", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;

        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

notificationRouter.delete("/notifications/:id", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: userId
        });

        if (!notification) {
            return next(new AppError("Notification not found", 404));
        }

        res.json({ message: "Notification deleted" });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

notificationRouter.delete("/notifications", userAuth, async (req, res, next) => {
    try {
        const userId = req.user._id;

        const result = await Notification.deleteMany({ recipient: userId });

        res.json({
            message: "All notifications deleted",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
});

module.exports = notificationRouter;
