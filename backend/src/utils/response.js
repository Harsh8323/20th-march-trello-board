const sendSuccess = (res, data = {}, message = null) => {
    return res.json({
        success: true,
        message,
        ...data
    });
};

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    sendSuccess,
    sendError
};
