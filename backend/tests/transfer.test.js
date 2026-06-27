const request = require("supertest");
const app = require("../src/app");

describe("Transfer endpoint", () => {

  let senderToken;
  let recipientToken;

  beforeAll(async () => {
    const senderRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sender User",
        email: "sender@flo.com",
        password: "test1234",
      });
    senderToken = senderRes.body.token;

    const recipientRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Recipient User",
        email: "recipient@flo.com",
        password: "test1234",
      });
    recipientToken = recipientRes.body.token;

    await request(app)
      .post("/api/wallet/deposit")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ amount: 200 });
  });

  test("should transfer money successfully between two users", async () => {
    const res = await request(app)
      .post("/api/wallet/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ recipientEmail: "recipient@flo.com", amount: 50 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Transfer successful");
  });

  test("sender balance should decrease after transfer", async () => {
    const res = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${senderToken}`);

    expect(res.body.balance).toBe(150);
  });

  test("recipient balance should increase after transfer", async () => {
    const res = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${recipientToken}`);

    expect(res.body.balance).toBe(50);
  });

  test("should reject transfer to non-existent recipient", async () => {
    const res = await request(app)
      .post("/api/wallet/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ recipientEmail: "ghost@flo.com", amount: 10 });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Recipient not found");
  });

  test("should reject transfer to self", async () => {
    const res = await request(app)
      .post("/api/wallet/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ recipientEmail: "sender@flo.com", amount: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Cannot transfer to yourself");
  });

  test("should reject transfer exceeding sender balance", async () => {
    const res = await request(app)
      .post("/api/wallet/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ recipientEmail: "recipient@flo.com", amount: 10000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Insufficient funds");
  });

  test("transaction history should reflect the transfer for both users", async () => {
    const senderHistory = await request(app)
      .get("/api/wallet/transactions")
      .set("Authorization", `Bearer ${senderToken}`);

    const recipientHistory = await request(app)
      .get("/api/wallet/transactions")
      .set("Authorization", `Bearer ${recipientToken}`);

    expect(senderHistory.body.length).toBeGreaterThan(0);
    expect(recipientHistory.body.length).toBeGreaterThan(0);
    expect(senderHistory.body[0].type).toBe("transfer");
    expect(recipientHistory.body[0].type).toBe("transfer");
  });

});