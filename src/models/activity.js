const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        count: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

activitySchema.index({ userId: 1, date: 1 }, { unique: true });

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;
