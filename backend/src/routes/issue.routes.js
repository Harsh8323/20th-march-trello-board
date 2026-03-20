const { authMiddleware } = require("../middleware/auth.middleware");
const { create, getAll, update, remove } = require("../controllers/issue.controller");
const { Router } = require("express");

const router = Router();

router.post("/", authMiddleware, create);
router.get("/all", authMiddleware, getAll);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

module.exports = router;
