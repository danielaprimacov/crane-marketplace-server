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
  createCraneDoc,
  buildInquiryPayload,
  createInquiryDoc,
  getId,
} = require("../helpers/testFactory");

const Inquiry = require("../../models/Inquiry.model");

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Inquiry API", () => {
  test("POST /inquiries creates a public inquiry", async () => {
    const { user } = await createUserAndToken();
    const crane = await createCraneDoc(user._id);

    const response = await request(app)
      .post("/inquiries")
      .send(buildInquiryPayload(crane._id));

    expect([200, 201]).toContain(response.statusCode);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("crane", String(crane._id));
    expect(response.body).toHaveProperty("status", "new");
    expect(response.body).toHaveProperty("isRead", false);
    expect(response.body).toHaveProperty("createdAt");

    expect(response.body).not.toHaveProperty("customerName");
    expect(response.body).not.toHaveProperty("email");
    expect(response.body).not.toHaveProperty("message");

    const savedInquiry = await Inquiry.findById(response.body.id).lean();

    expect(savedInquiry).toBeTruthy();
    expect(savedInquiry.customerName).toBe("Test Customer");
    expect(savedInquiry.email).toBe("customer@test.com");
    expect(savedInquiry.message).toBe(
      "We need more information about this crane."
    );
    expect(String(savedInquiry.crane)).toBe(String(crane._id));
    expect(savedInquiry.status).toBe("new");
    expect(savedInquiry.isRead).toBe(false);
  });

  test("GET /inquiries rejects normal user", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app)
      .get("/inquiries")
      .set(authHeader(token));

    expect([401, 403]).toContain(response.statusCode);
  });

  test("GET /inquiries allows admin", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const admin = await createAdminAndToken();

    const crane = await createCraneDoc(owner.user._id);
    await createInquiryDoc(crane._id);

    const response = await request(app)
      .get("/inquiries")
      .set(authHeader(admin.token));

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  test("GET /inquiries/:inquiryId allows admin", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const admin = await createAdminAndToken();

    const crane = await createCraneDoc(owner.user._id);
    const inquiry = await createInquiryDoc(crane._id);

    const response = await request(app)
      .get(`/inquiries/${inquiry._id}`)
      .set(authHeader(admin.token));

    expect(response.statusCode).toBe(200);
    expect(getId(response.body)).toBe(String(inquiry._id));
  });

  test("PUT /inquiries/:inquiryId allows admin to update status", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const admin = await createAdminAndToken();

    const crane = await createCraneDoc(owner.user._id);
    const inquiry = await createInquiryDoc(crane._id);

    const response = await request(app)
      .put(`/inquiries/${inquiry._id}`)
      .set(authHeader(admin.token))
      .send({
        status: "in_progress",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("in_progress");
  });

  test("PUT /inquiries/:inquiryId rejects normal user", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const normalUser = await createUserAndToken({
      email: "normal@test.com",
    });

    const crane = await createCraneDoc(owner.user._id);
    const inquiry = await createInquiryDoc(crane._id);

    const response = await request(app)
      .put(`/inquiries/${inquiry._id}`)
      .set(authHeader(normalUser.token))
      .send({
        status: "resolved",
      });

    expect([401, 403]).toContain(response.statusCode);
  });

  test("DELETE /inquiries/:inquiryId allows admin", async () => {
    const owner = await createUserAndToken({
      email: "owner@test.com",
    });

    const admin = await createAdminAndToken();

    const crane = await createCraneDoc(owner.user._id);
    const inquiry = await createInquiryDoc(crane._id);

    const response = await request(app)
      .delete(`/inquiries/${inquiry._id}`)
      .set(authHeader(admin.token));

    expect([200, 204]).toContain(response.statusCode);

    const listResponse = await request(app)
      .get("/inquiries")
      .set(authHeader(admin.token));

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.length).toBe(0);
  });
});
