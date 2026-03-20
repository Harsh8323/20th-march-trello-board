const { ORGANIZATIONS, BOARDS, ISSUES } = require("../data/store");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendSuccess, sendError } = require("../utils/response");

let BOARD_ID = 1;

const findBoardById = (id) => BOARDS.find(b => b.id === id);
const findOrganizationById = (id) => ORGANIZATIONS.find(org => org.id === id);
const hasOrgAccess = (org, userId) => org && (org.admin === userId || org.members.includes(userId));

const create = (req, res) => {
    const userId = req.userId;
    const { organizationId, title, description } = req.body;

    if (!organizationId || !title) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const organization = findOrganizationById(organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.ORG_ACCESS_DENIED);
    }

    const newBoard = {
        id: BOARD_ID++,
        organizationId,
        title,
        description: description || "",
        createdAt: new Date()
    };

    BOARDS.push(newBoard);

    return sendSuccess(res, { boardId: newBoard.id }, MESSAGES.BOARD_CREATED);
};

const getAll = (req, res) => {
    const userId = req.userId;
    const organizationId = parseInt(req.query.organizationId);

    if (!organizationId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const organization = findOrganizationById(organizationId);

    if (!organization) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.ORG_NOT_FOUND);
    }

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.ORG_ACCESS_DENIED);
    }

    const boards = BOARDS
        .filter(board => board.organizationId === organizationId)
        .map(board => ({
            id: board.id,
            title: board.title,
            description: board.description,
            issueCount: ISSUES.filter(i => i.boardId === board.id).length
        }));

    return sendSuccess(res, { boards });
};

const getOne = (req, res) => {
    const userId = req.userId;
    const boardId = parseInt(req.params.id);

    if (!boardId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const board = findBoardById(boardId);

    if (!board) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.BOARD_NOT_FOUND);
    }

    const organization = findOrganizationById(board.organizationId);

    if (!hasOrgAccess(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.BOARD_ACCESS_DENIED);
    }

    return sendSuccess(res, { board });
};

module.exports = {
    create,
    getAll,
    getOne
};
