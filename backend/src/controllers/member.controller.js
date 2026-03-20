const { USERS, ORGANIZATIONS } = require("../data/store");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendSuccess, sendError } = require("../utils/response");

const findUserByUsername = (username) => USERS.find(u => u.username === username);
const findOrganizationById = (id) => ORGANIZATIONS.find(org => org.id === id);
const isOrgAdmin = (org, userId) => org && org.admin === userId;
const hasOrgAccess = (org, userId) => isOrgAdmin(org, userId) || org.members.includes(userId);

const addMember = (req, res) => {
    const userId = req.userId;
    const { organizationId, memberUsername } = req.body;

    if (!organizationId || !memberUsername) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const organization = findOrganizationById(organizationId);

    if (!isOrgAdmin(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.ORG_ACCESS_DENIED);
    }

    const memberUser = findUserByUsername(memberUsername);

    if (!memberUser) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.MEMBER_NOT_FOUND);
    }

    if (organization.members.includes(memberUser.id)) {
        return sendError(res, STATUS_CODES.CONFLICT, "User is already a member of this organization");
    }

    if (organization.admin === memberUser.id) {
        return sendError(res, STATUS_CODES.CONFLICT, "Cannot add admin as a member");
    }

    organization.members.push(memberUser.id);

    return sendSuccess(res, {}, MESSAGES.MEMBER_ADDED);
};

const removeMember = (req, res) => {
    const userId = req.userId;
    const organizationId = parseInt(req.query.organizationId);
    const memberUsername = req.query.memberUsername;

    if (!organizationId || !memberUsername) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const organization = findOrganizationById(organizationId);

    if (!isOrgAdmin(organization, userId)) {
        return sendError(res, STATUS_CODES.FORBIDDEN, MESSAGES.ORG_ACCESS_DENIED);
    }

    const memberUser = findUserByUsername(memberUsername);

    if (!memberUser) {
        return sendError(res, STATUS_CODES.NOT_FOUND, MESSAGES.MEMBER_NOT_FOUND);
    }

    if (!organization.members.includes(memberUser.id)) {
        return sendError(res, STATUS_CODES.NOT_FOUND, "Member not found in this organization");
    }

    organization.members = organization.members.filter(id => id !== memberUser.id);

    return sendSuccess(res, {}, MESSAGES.MEMBER_REMOVED);
};

const getMembers = (req, res) => {
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

    const members = organization.members.map(memberId => {
        const user = USERS.find(u => u.id === memberId);
        return user ? { id: user.id, username: user.username } : null;
    }).filter(Boolean);

    return sendSuccess(res, { members });
};

module.exports = {
    addMember,
    removeMember,
    getMembers
};
