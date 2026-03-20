const { USERS, ORGANIZATIONS, ISSUES, BOARDS } = require("../data/store");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendSuccess, sendError } = require("../utils/response");

let ISSUES_ID = 1;

const findIssueById = (id) => ISSUES.find(i => i.id === id);
const findOrganizationById = (id) => ORGANIZATIONS.find(org => org.id === id);
const findUserByUsername = (username) => USERS.find(u => u.username === username);
const hasOrgAccess = (org, userId) => org && (org.admin === userId || org.members.includes(userId));

const create = (req, res) => {
    const userId = req.userId;
    const { boardId, title, description, assigneeUsername } = req.body;

    if (!boardId || !title) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const board = BOARDS.find(b => b.id === boardId);

    if (!board) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.BOARD_NOT_FOUND);
    }

    const organization = findOrganizationById(board.organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.BOARD_ACCESS_DENIED);
    }

    let assigneeId = null;
    if (assigneeUsername) {
        const assignee = findUserByUsername(assigneeUsername);
        if (assignee && hasOrgAccess(organization, assignee.id)) {
            assigneeId = assignee.id;
        }
    }

    const newIssue = {
        id: ISSUES_ID++,
        boardId,
        title,
        description: description || "",
        status: "TODO",
        assigneeId,
        createdBy: userId,
        createdAt: new Date()
    };

    ISSUES.push(newIssue);

    return sendSuccess(res, { issueId: newIssue.id }, MESSAGES.ISSUE_CREATED);
};

const getAll = (req, res) => {
    const userId = req.userId;
    const boardId = parseInt(req.query.boardId);

    if (!boardId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const board = BOARDS.find(b => b.id === boardId);

    if (!board) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.BOARD_NOT_FOUND);
    }

    const organization = findOrganizationById(board.organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.BOARD_ACCESS_DENIED);
    }

    const issues = ISSUES
        .filter(issue => issue.boardId === boardId)
        .map(issue => {
            const assignee = issue.assigneeId ? USERS.find(u => u.id === issue.assigneeId) : null;
            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                status: issue.status,
                assignee: assignee ? { id: assignee.id, username: assignee.username } : null
            };
        });

    return sendSuccess(res, { issues });
};

const update = (req, res) => {
    const userId = req.userId;
    const issueId = parseInt(req.params.id);
    const { title, description, status, assigneeUsername } = req.body;

    if (!issueId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const issue = findIssueById(issueId);

    if (!issue) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.ISSUE_NOT_FOUND);
    }

    const board = BOARDS.find(b => b.id === issue.boardId);
    const organization = findOrganizationById(board.organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.BOARD_ACCESS_DENIED);
    }

    if (title) {
        issue.title = title;
    }

    if (description !== undefined) {
        issue.description = description;
    }

    if (status && ["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        issue.status = status;
    }

    if (assigneeUsername !== undefined) {
        if (assigneeUsername === null) {
            issue.assigneeId = null;
        } else {
            const assignee = findUserByUsername(assigneeUsername);
            if (assignee && hasOrgAccess(organization, assignee.id)) {
                issue.assigneeId = assignee.id;
            }
        }
    }

    issue.updatedAt = new Date();

    return sendSuccess(res, {}, MESSAGES.ISSUE_UPDATED);
};

const remove = (req, res) => {
    const userId = req.userId;
    const issueId = parseInt(req.params.id);

    if (!issueId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const issue = findIssueById(issueId);

    if (!issue) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.ISSUE_NOT_FOUND);
    }

    const board = BOARDS.find(b => b.id === issue.boardId);
    const organization = findOrganizationById(board.organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.BOARD_ACCESS_DENIED);
    }

    const index = ISSUES.findIndex(i => i.id === issueId);
    ISSUES.splice(index, 1);

    return sendSuccess(res, {}, MESSAGES.ISSUE_DELETED);
};

module.exports = {
    create,
    getAll,
    update,
    remove
};
