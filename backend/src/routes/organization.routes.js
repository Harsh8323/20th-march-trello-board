const { authMiddleware } = require("../middleware/auth.middleware");
const { create, getOne } = require("../controllers/organization.controller");
const { Router } = require("express");

const router = Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, getOne);

module.exports = router;
