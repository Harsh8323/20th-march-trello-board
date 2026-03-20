const jwt = require("jsonwebtoken");
const { USERS } = require("../data/store");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendSuccess, sendError } = require("../utils/response");

const JWT_SECRET = "attlasiationsupersecret123123password";

let USERS_ID = 1;

const findUserById = (id) => USERS.find(u => u.id === id);
const findUserByUsername = (username) => USERS.find(u => u.username === username);

const signup = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    if (findUserByUsername(username)) {
        return sendError(res, STATUS_CODES.CONFLICT, MESSAGES.USER_EXISTS);
    }

    USERS.push({
        username,
        password,
        id: USERS_ID++
    });

    return sendSuccess(res, {}, MESSAGES.SIGNUP_SUCCESS);
};

const signin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const user = findUserByUsername(username);

    if (!user) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
    }

    if (user.password !== password) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return sendSuccess(res, { token }, MESSAGES.SIGNIN_SUCCESS);
};

module.exports = {
    signup,
    signin
};
