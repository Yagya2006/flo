const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

exports.getSummary = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const transactions = await Transaction.find({ wallet: wallet._id });

    const totalIn = transactions
      .filter((tx) => tx.type === "deposit" || (tx.type === "transfer" && tx.recipient?.toString() === req.user.id))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalOut = transactions
      .filter((tx) => tx.type === "withdrawal" || (tx.type === "transfer" && tx.sender?.toString() === req.user.id))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const last30Days = transactions.filter((tx) => {
      const daysAgo = (Date.now() - new Date(tx.createdAt)) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const dailyMap = {};
    last30Days.forEach((tx) => {
      const day = new Date(tx.createdAt).toISOString().split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, in: 0, out: 0 };

      const isCredit = tx.type === "deposit" || (tx.type === "transfer" && tx.recipient?.toString() === req.user.id);
      if (isCredit) {
        dailyMap[day].in += tx.amount;
      } else {
        dailyMap[day].out += tx.amount;
      }
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    const typeBreakdown = [
      { name: "Deposits", value: transactions.filter((tx) => tx.type === "deposit").reduce((s, tx) => s + tx.amount, 0) },
      { name: "Withdrawals", value: transactions.filter((tx) => tx.type === "withdrawal").reduce((s, tx) => s + tx.amount, 0) },
      { name: "Transfers", value: transactions.filter((tx) => tx.type === "transfer").reduce((s, tx) => s + tx.amount, 0) },
    ].filter((item) => item.value > 0);

    res.json({
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      dailyBreakdown,
      typeBreakdown,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};