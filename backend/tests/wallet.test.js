const request = require("supertest");
const app = require("../src/app");

describe("Wallet endpoints", () => {

  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Wallet Test User",
        email: "wallettest@flo.com",
        password: "test1234",
      });

    token = res.body.token;
  });

  test("should get wallet with starting balance of 0", async () => {
    const res = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.balance).toBe(0);
  });

  test("should reject wallet access with no token", async () => {
    const res = await request(app)
      .get("/api/wallet");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token");
  });

  test("should deposit money and increase balance", async () => {
    const res = await request(app)
      .post("/api/wallet/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body.wallet.balance).toBe(100);
    expect(res.body.transaction.type).toBe("deposit");
  });

  test("should reject deposit with negative amount", async () => {
    const res = await request(app)
      .post("/api/wallet/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: -50 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid amount");
  });

  test("should withdraw money and decrease balance", async () => {
    const res = await request(app)
      .post("/api/wallet/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 30 });

    expect(res.statusCode).toBe(201);
    expect(res.body.wallet.balance).toBe(70);
  });

  test("should reject withdrawal exceeding balance", async () => {
    const res = await request(app)
      .post("/api/wallet/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 1000 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Insufficient funds");
  });

});