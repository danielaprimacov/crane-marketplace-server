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

function buildSignupPayload(overrides = {}) {
  return {
    name: "Test User",
    email: "user@test.com",
    password: "Test123456!",
    termsAccepted: true,
    privacyPolicyAccepted: true,
    marketingConsent: false,
    ...overrides,
  };
}

describe("Auth API", () => {
  test("POST /auth/signup creates a user", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send(buildSignupPayload());

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("user@test.com");
    expect(response.body.user).not.toHaveProperty("password");

    expect(response.body.user).toHaveProperty("privacy");
    expect(response.body.user.privacy).toHaveProperty("termsAcceptedAt");
    expect(response.body.user.privacy).toHaveProperty(
      "privacyPolicyAcceptedAt"
    );
    expect(response.body.user.privacy.marketingConsent).toBe(false);
  });

  test("POST /auth/signup fails without terms acceptance", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send(
        buildSignupPayload({
          termsAccepted: false,
        })
      );

    expect(response.statusCode).toBe(400);
  });

  test("POST /auth/signup fails without privacy policy acceptance", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send(
        buildSignupPayload({
          privacyPolicyAccepted: false,
        })
      );

    expect(response.statusCode).toBe(400);
  });

  test("POST /auth/signup allows optional marketing consent", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send(
        buildSignupPayload({
          marketingConsent: true,
        })
      );

    expect(response.statusCode).toBe(201);
    expect(response.body.user.privacy.marketingConsent).toBe(true);
    expect(response.body.user.privacy.marketingConsentAt).toBeTruthy();
  });

  test("POST /auth/login returns a token", async () => {
    await request(app).post("/auth/signup").send(buildSignupPayload());

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
    await request(app).post("/auth/signup").send(buildSignupPayload());

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
