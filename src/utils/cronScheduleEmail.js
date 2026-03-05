const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns")
const ConnectionRequest = require("../models/connectionRequest")
const sendEmail = require("./sendEmail")

const yesterDay = subDays(new Date(), 0);
const start = startOfDay(yesterDay);
const end = endOfDay(yesterDay);

cron.schedule("* * * * * ", async () => {
    try {
        const pendingRequests =await ConnectionRequest.find({
            status: "interested",
            createdAt: {
                $gte: start,
                $lt: end
            }
        }).populate("fromUserId toUserId")

        const emails = [...new Set(pendingRequests.map((req) => req.toUserId.email))]
        console.log(emails);

        for (const email of emails) {
            try {
                const res = await sendEmail(email, "Pending Requests", "You have connection requests pending so please review them", "<h1>Review Requests</h1>");
                console.log(res);
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.error(error);
    }
})


