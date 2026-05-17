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
  createAdminAndToken,
  buildCranePayload,
  createCraneDoc,
  getId,
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

describe("Crane API", () => {
  test("GET /cranes returns public crane list", async () => {
    const { user } = await createUserAndToken();

    await createCraneDoc(user._id, {
      location: "Public Test Location",
    });

    const response = await request(app).get("/cranes");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);

    expect(response.body[0]).toHaveProperty("producer", "Liebherr");
    expect(response.body[0]).toHaveProperty("seriesCode", "200 EC-H");
    expect(response.body[0]).toHaveProperty("owner");
  });

  test("POST /cranes fails without token", async () => {
    const response = await request(app)
      .post("/cranes")
      .send(buildCranePayload());

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });

  test("POST /cranes creates a crane for authenticated user", async () => {
    const { user, token } = await createUserAndToken();

    const response = await request(app)
      .post("/cranes")
      .set(authHeader(token))
      .send(buildCranePayload());

    expect([200, 201]).toContain(response.statusCode);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("producer", "Liebherr");
    expect(response.body).toHaveProperty("seriesCode", "200 EC-H");
    expect(response.body).toHaveProperty("capacityClassNumber", 10);
    
    expect(response.body).toHaveProperty("ownerId");
    expect(response.body.ownerId).toBe(String(user._id));

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("__v");
  });

  test("GET /cranes/my returns only current user's cranes", async () => {
    const first = await createUserAndToken({
      email: "first@test.com",
    });

    const second = await createUserAndToken({
      email: "second@test.com",
    });

    await createCraneDoc(first.user._id, {
      location: "First User Location",
    });

    await createCraneDoc(second.user._id, {
      location: "Second User Location",
    });

    const response = await request(app)
      .get("/cranes/my")
      .set(authHeader(first.token));

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].location).toBe("First User Location");
  });

  test("PUT /cranes/:craneId allows owner to update own crane", async () => {
    const { user, token } = await createUserAndToken();

    const crane = await createCraneDoc(user._id, {
      description: "Original description.",
    });

    const response = await request(app)
      .put(`/cranes/${crane._id}`)
      .set(authHeader(token))
      .send({
        description: "Updated crane description.",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe("Updated crane description.");
    expect(getId(response.body)).toBe(String(crane._id));
  });

  test("PUT /cranes/:craneId rejects another normal user", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const other = await createUserAndToken({
      email: "other@test.com",
    });

    const crane = await createCraneDoc(owner.user._id);

    const response = await request(app)
      .put(`/cranes/${crane._id}`)
      .set(authHeader(other.token))
      .send({
        description: "Illegal update attempt.",
      });

    expect([401, 403]).toContain(response.statusCode);
  });

  test("PUT /cranes/:craneId allows admin to update any crane", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const admin = await createAdminAndToken();

    const crane = await createCraneDoc(owner.user._id);

    const response = await request(app)
      .put(`/cranes/${crane._id}`)
      .set(authHeader(admin.token))
      .send({
        description: "Admin updated crane description.",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.description).toBe("Admin updated crane description.");
  });

  test("DELETE /cranes/:craneId allows owner to delete own crane", async () => {
    const { user, token } = await createUserAndToken();

    const crane = await createCraneDoc(user._id);

    const response = await request(app)
      .delete(`/cranes/${crane._id}`)
      .set(authHeader(token));

    expect([200, 204]).toContain(response.statusCode);

    const listResponse = await request(app).get("/cranes");

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.length).toBe(0);
  });

  test("GET /cranes/:craneId returns 400 for invalid id", async () => {
    const response = await request(app).get("/cranes/not-valid-id");

    expect(response.statusCode).toBe(400);
  });
});
