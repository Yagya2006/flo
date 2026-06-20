const Goal = require("../models/Goal");
const Wallet = require("../models/Wallet");

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    if (!name || !targetAmount || targetAmount <= 0) {
      return res.status(400).json({ message: "Invalid goal data" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    goal.savedAmount += amount;
    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    await goal.save();

    res.json({ goal, wallet });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const wallet = await Wallet.findOne({ user: req.user.id });
    wallet.balance += goal.savedAmount;
    await wallet.save();

    await Goal.deleteOne({ _id: goal._id });

    res.json({ message: "Goal deleted, funds returned to wallet", wallet });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};