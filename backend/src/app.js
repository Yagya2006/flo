const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const goalRoutes = require("./routes/goalRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/goals", goalRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Flo API is running" });
});

module.exports = app;
