const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const goalRoutes = require("./routes/goalRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/wallet", generalLimiter, walletRoutes);
app.use("/api/goals", generalLimiter, goalRoutes);
app.use("/api/users", generalLimiter, userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Flo API is running" });
});

module.exports = app;