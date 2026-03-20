const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409
};

const MESSAGES = {
    USER_EXISTS: "User with this username already exists",
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Incorrect credentials",
    SIGNUP_SUCCESS: "You have signed up successfully",
    SIGNIN_SUCCESS: "You have signed in successfully",
    TOKEN_INVALID: "Token was incorrect",
    TOKEN_MISSING: "Token is required",
    ORG_CREATED: "Organization created successfully",
    ORG_NOT_FOUND: "Organization not found",
    ORG_ACCESS_DENIED: "You are not an admin of this organization",
    MEMBER_ADDED: "Member added to organization",
    MEMBER_REMOVED: "Member removed from organization",
    MEMBER_NOT_FOUND: "No user with this username exists",
    BOARD_CREATED: "Board created successfully",
    BOARD_NOT_FOUND: "Board not found",
    BOARD_ACCESS_DENIED: "You don't have access to this board",
    ISSUE_CREATED: "Issue created successfully",
    ISSUE_NOT_FOUND: "Issue not found",
    ISSUE_UPDATED: "Issue updated successfully",
    ISSUE_DELETED: "Issue deleted successfully",
    MISSING_FIELDS: "Required fields are missing"
};

module.exports = {
    STATUS_CODES,
    MESSAGES
};
