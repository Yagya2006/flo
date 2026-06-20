const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getGoals, createGoal, addToGoal, deleteGoal } = require("../controllers/goalController");

router.use(protect);

router.get("/", getGoals);
router.post("/", createGoal);
router.post("/:id/add", addToGoal);
router.delete("/:id", deleteGoal);

module.exports = router;