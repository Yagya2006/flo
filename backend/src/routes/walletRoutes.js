const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getWallet, deposit, withdraw } = require("../controllers/walletController");
const { transfer, getTransactions } = require("../controllers/transferController");
const { getSummary } = require("../controllers/analyticsController");
router.use(protect);

router.get("/", getWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);
router.get("/transactions", getTransactions);
router.get("/analytics", getSummary);
module.exports = router;
