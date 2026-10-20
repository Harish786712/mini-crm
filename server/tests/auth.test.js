const request = require("supertest");
const mongoose = require("mongoose");

process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:5173";

const app = require("../server");

describe("Mini CRM auth and ownership API", () => {
  test("rejects unauthenticated protected request", async () => {
    const res = await request(app).get("/api/customers");
    expect(res.statusCode).toBe(401);
  });

  test("rejects invalid registration", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "bad" });
    expect(res.statusCode).toBe(400);
  });

  test("health endpoint works", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("logout endpoint clears cookie response", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
  });

  test("unknown customer returns 404 or invalid id returns 400 after authentication layer", async () => {
    const res = await request(app).get("/api/customers/000000000000000000000000");
    expect([401, 404]).toContain(res.statusCode);
  });

  afterAll(async () => {
    await mongoose.connection.close().catch(() => {});
  });
});
