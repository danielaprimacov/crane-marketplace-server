const request = require("supertest");
const app = require("../../app");

const {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} = require("../helpers/testDb");

const {
  authHeader,
  createUserAndToken,
  loginUser,
} = require("../helpers/testFactory");

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("User/Profile API", () => {
  test("GET /users/profile rejects unauthenticated request", async () => {
    const response = await request(app).get("/users/profile");

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });

  test("GET /users/profile returns current user", async () => {
    const { token } = await createUserAndToken({
      name: "Profile User",
      email: "profile@test.com",
    });

    const response = await request(app)
      .get("/users/profile")
      .set(authHeader(token));

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("email", "profile@test.com");
    expect(response.body).not.toHaveProperty("password");
  });

  test("PATCH /users/profile updates name and email", async () => {
    const { token } = await createUserAndToken({
      name: "Old Name",
      email: "old@test.com",
    });

    const response = await request(app)
      .patch("/users/profile")
      .set(authHeader(token))
      .send({
        name: "New Name",
        email: "new@test.com",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", "New Name");
    expect(response.body).toHaveProperty("email", "new@test.com");
  });

  test("PATCH /users/profile updates password", async () => {
    const { token } = await createUserAndToken({
      name: "Password User",
      email: "password@test.com",
      password: "OldPassword123!",
    });

    const updateResponse = await request(app)
      .patch("/users/profile")
      .set(authHeader(token))
      .send({
        name: "Password User",
        email: "password@test.com",
        currentPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
      });

    expect(updateResponse.statusCode).toBe(200);

    const oldLogin = await loginUser({
      email: "password@test.com",
      password: "OldPassword123!",
    });

    expect(oldLogin.response.statusCode).toBeGreaterThanOrEqual(400);

    const newLogin = await loginUser({
      email: "password@test.com",
      password: "NewPassword123!",
    });

    expect(newLogin.response.statusCode).toBe(200);
    expect(newLogin.token).toBeTruthy();
  });
});
