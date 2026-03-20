const { USERS, ORGANIZATIONS } = require("../data/store");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");
const { sendSuccess, sendError } = require("../utils/response");

let ORGANIZATION_ID = 1;

const findOrganizationById = (id) => ORGANIZATIONS.find(org => org.id === id);
const isOrgAdmin = (org, userId) => org && org.admin === userId;
const isOrgMember = (org, userId) => org && org.members.includes(userId);
const hasOrgAccess = (org, userId) => isOrgAdmin(org, userId) || isOrgMember(org, userId);

const create = (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, MESSAGES.MISSING_FIELDS);
    }

    const newOrg = {
        id: ORGANIZATION_ID++,
        title,
        description: description || "",
        admin: req.userId,
        members: []
    };

    ORGANIZATIONS.push(newOrg);

    return sendSuccess(res, { organizationId: newOrg.id }, MESSAGES.ORG_CREATED);
};

const getOne = (req, res) => {
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

    const orgWithMembers = {
        ...organization,
        members: organization.members.map(memberId => {
            const user = USERS.find(u => u.id === memberId);
            return user ? { id: user.id, username: user.username } : null;
        }).filter(Boolean)
    };

    return sendSuccess(res, { organization: orgWithMembers });
};

module.exports = {
    create,
    getOne
};
