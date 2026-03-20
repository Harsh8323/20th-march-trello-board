const { authMiddleware } = require("../middleware/auth.middleware");
const { create, getAll, getOne } = require("../controllers/board.controller");
const { Router } = require("express");

const router = Router();

router.post("/", authMiddleware, create);
router.get("/all", authMiddleware, getAll);
router.get("/:id", authMiddleware, getOne);

module.exports = router;
