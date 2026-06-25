const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");

describe("Auth endpoints", () => {

  test("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "testuser@flo.com",
        password: "test1234",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("testuser@flo.com");
  });


  test("should reject registration with duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another User",
        email: "testuser@flo.com",
        password: "test1234",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email already in use");
  });

});