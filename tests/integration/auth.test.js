const request = require("supertest");
const app = require("../../app");

const {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} = require("../helpers/testDb");

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Auth API", () => {
  test("POST /auth/signup creates a user", async () => {
    const response = await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "user@test.com",
      password: "Test123456!",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("user@test.com");
    expect(response.body.user).not.toHaveProperty("password");
  });

  test("POST /auth/login returns a token", async () => {
    await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "user@test.com",
      password: "Test123456!",
    });

    const response = await request(app).post("/auth/login").send({
      email: "user@test.com",
      password: "Test123456!",
    });

    expect(response.statusCode).toBe(200);

    const token = response.body.authToken || response.body.token;

    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });

  test("POST /auth/login fails with wrong password", async () => {
    await request(app).post("/auth/signup").send({
      name: "Test User",
      email: "user@test.com",
      password: "Test123456!",
    });

    const response = await request(app).post("/auth/login").send({
      email: "user@test.com",
      password: "WrongPassword123!",
    });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("GET /auth/verify fails without token", async () => {
    const response = await request(app).get("/auth/verify");

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });
});