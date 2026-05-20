const request = require("supertest");
const app = require("../../app");

const User = require("../../models/User.model");

const {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} = require("../helpers/testDb");

const {
  authHeader,
  createUserAndToken,
  loginUser,
  createCraneDoc,
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

  test("GET /users/me/export rejects unauthenticated request", async () => {
    const response = await request(app).get("/users/me/export");

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });

  test("GET /users/me/export returns current user data without password", async () => {
    const { user, token } = await createUserAndToken({
      name: "Export User",
      email: "export@test.com",
    });

    await createCraneDoc(user._id, {
      producer: "Export Producer",
      seriesCode: "Export Series",
      description: "Export Test Crane",
    });

    const response = await request(app)
      .get("/users/me/export")
      .set(authHeader(token));

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("exportedAt");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email", "export@test.com");
    expect(response.body.user).not.toHaveProperty("password");

    expect(response.body).toHaveProperty("cranes");
    expect(Array.isArray(response.body.cranes)).toBe(true);
    expect(response.body.cranes.length).toBe(1);
    expect(response.body.cranes[0]).toHaveProperty(
      "producer",
      "Export Producer"
    );
    expect(response.body.cranes[0]).toHaveProperty(
      "seriesCode",
      "Export Series"
    );
    expect(response.body.cranes[0]).toHaveProperty(
      "description",
      "Export Test Crane"
    );

    expect(response.body).toHaveProperty("inquiriesSubmittedByEmail");
    expect(Array.isArray(response.body.inquiriesSubmittedByEmail)).toBe(true);

    expect(response.body).toHaveProperty("messagesSubmittedByEmail");
    expect(Array.isArray(response.body.messagesSubmittedByEmail)).toBe(true);
  });

  test("DELETE /users/me rejects unauthenticated request", async () => {
    const response = await request(app).delete("/users/me");

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });

  test("DELETE /users/me anonymizes current user", async () => {
    const { user, token } = await createUserAndToken({
      name: "Delete User",
      email: "delete@test.com",
      password: "DeletePassword123!",
    });

    const response = await request(app)
      .delete("/users/me")
      .set(authHeader(token));

    expect([200, 204]).toContain(response.statusCode);

    const deletedUser = await User.findById(user._id).lean();

    expect(deletedUser).toBeTruthy();
    expect(deletedUser.isDeleted).toBe(true);
    expect(deletedUser.deletedAt).toBeTruthy();
    expect(deletedUser.name).toBe("Deleted user");
    expect(deletedUser.email).toBe(`deleted-user-${user._id}@deleted.local`);
    expect(deletedUser.privacy.marketingConsent).toBe(false);
    expect(deletedUser.privacy.marketingConsentAt).toBeNull();
  });

  test("deleted user cannot login again", async () => {
    const { token } = await createUserAndToken({
      name: "Deleted Login User",
      email: "deleted-login@test.com",
      password: "DeletePassword123!",
    });

    const deleteResponse = await request(app)
      .delete("/users/me")
      .set(authHeader(token));

    expect([200, 204]).toContain(deleteResponse.statusCode);

    const loginAfterDelete = await loginUser({
      email: "deleted-login@test.com",
      password: "DeletePassword123!",
    });

    expect(loginAfterDelete.response.statusCode).toBeGreaterThanOrEqual(400);
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
