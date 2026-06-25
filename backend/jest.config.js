module.exports = {
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["./tests/setup.js"],
  testTimeout: 10000,
};