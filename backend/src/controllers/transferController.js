const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.transfer = async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const sender = await User.findById(req.user.id);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    const senderWallet = await Wallet.findOne({ user: sender._id });
    const recipientWallet = await Wallet.findOne({ user: recipient._id });

    if (!senderWallet || !recipientWallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (senderWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    senderWallet.balance -= amount;
    await senderWallet.save();

    recipientWallet.balance += amount;
    await recipientWallet.save();

    const senderTransaction = await Transaction.create({
      wallet: senderWallet._id,
      sender: sender._id,
      recipient: recipient._id,
      type: "transfer",
      amount,
      balanceAfter: senderWallet.balance,
    });

    const recipientTransaction = await Transaction.create({
      wallet: recipientWallet._id,
      sender: sender._id,
      recipient: recipient._id,
      type: "transfer",
      amount,
      balanceAfter: recipientWallet.balance,
    });

    res.status(201).json({
      message: "Transfer successful",
      transaction: senderTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
