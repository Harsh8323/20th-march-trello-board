const jwt = require("jsonwebtoken");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendError } = require("../utils/response");

const JWT_SECRET = "attlasiationsupersecret123123password";

const authMiddleware = (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.TOKEN_MISSING);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        if (userId) {
            req.userId = userId;
            next();
        } else {
            sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.TOKEN_INVALID);
        }
    } catch (err) {
        sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.TOKEN_INVALID);
    }
};

module.exports = {
    authMiddleware
};
