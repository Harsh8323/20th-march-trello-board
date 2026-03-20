const { authMiddleware } = require("../middleware/auth.middleware");
const { addMember, removeMember, getMembers } = require("../controllers/member.controller");
const { Router } = require("express");

const router = Router();

router.post("/add", authMiddleware, addMember);
router.delete("/remove", authMiddleware, removeMember);
router.get("/list", authMiddleware, getMembers);

module.exports = router;
