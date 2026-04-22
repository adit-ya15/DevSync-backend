const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const startMs = Date.now();

    const shouldLog = req.method !== "OPTIONS";

    res.on("finish", () => {
        if (!shouldLog) return;

        const durationMs = Date.now() - startMs;
        const statusCode = res.statusCode;

        const forwardedFor = req.headers["x-forwarded-for"];
        const ip = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : (forwardedFor ? String(forwardedFor).split(",")[0].trim() : req.ip);

        const meta = {
            method: req.method,
            path: req.originalUrl,
            statusCode,
            durationMs,
            ip,
        };

        if (req.user?._id) {
            meta.userId = String(req.user._id);
        }

        if (statusCode >= 400) {
            logger.debug("Request completed", meta);
        } else {
            logger.info("Request completed", meta);
        }
    });

    next();
};

module.exports = requestLogger;
