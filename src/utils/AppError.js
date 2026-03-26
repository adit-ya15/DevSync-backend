class AppError extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode || 500;
        this.status = this.statusCode >= 400 && this.statusCode < 500 ? "fail" : "error";
        this.success = false;
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = AppError