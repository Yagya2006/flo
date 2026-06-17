const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

exports.getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet: wallet._id,
      recipient: req.user.id,
      type: "deposit",
      amount,
      balanceAfter: wallet.balance,
    });

    res.status(201).json({ wallet, transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    wallet.balance -= amount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet: wallet._id,
      sender: req.user.id,
      type: "withdrawal",
      amount,
      balanceAfter: wallet.balance,
    });

    res.status(201).json({ wallet, transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
