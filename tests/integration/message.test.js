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
  buildContactMessagePayload,
  buildExpertMessagePayload,
  buildNewsletterMessagePayload,
  createMessageDoc,
} = require("../helpers/testFactory");

const Message = require("../../models/Message.model");

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Message API", () => {
  test("POST /messages creates contact message", async () => {
    const response = await request(app)
      .post("/messages")
      .send(buildContactMessagePayload());

    expect([200, 201]).toContain(response.statusCode);

    expect(response.body).toHaveProperty(
      "message",
      "Message sent successfully."
    );
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty("formType", "contact");
    expect(response.body.data).toHaveProperty("createdAt");

    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("phone");
    expect(response.body.data).not.toHaveProperty("message");

    const savedMessage = await Message.findById(response.body.data.id).lean();

    expect(savedMessage).toBeTruthy();
    expect(savedMessage.formType).toBe("contact");
    expect(savedMessage.email).toBe("contact@test.com");
    expect(savedMessage.firstName).toBe("Test");
    expect(savedMessage.lastName).toBe("Contact");
    expect(savedMessage.message).toBe(
      "I would like to know more about your crane services."
    );
  });

  test("POST /messages creates expert message", async () => {
    const response = await request(app)
      .post("/messages")
      .send(buildExpertMessagePayload());

    expect([200, 201]).toContain(response.statusCode);

    expect(response.body).toHaveProperty(
      "message",
      "Message sent successfully."
    );
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty("formType", "expert");
    expect(response.body.data).toHaveProperty("createdAt");

    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("projectDetails");

    const savedMessage = await Message.findById(response.body.data.id).lean();

    expect(savedMessage).toBeTruthy();
    expect(savedMessage.formType).toBe("expert");
    expect(savedMessage.email).toBe("expert@test.com");
    expect(savedMessage.name).toBe("Test Expert Request");
    expect(savedMessage.company).toBe("Test Construction GmbH");
    expect(savedMessage.projectDetails).toBe(
      "We need help choosing a crane for a 7-floor building project."
    );
  });

  test("POST /messages creates newsletter message", async () => {
    const response = await request(app)
      .post("/messages")
      .send(buildNewsletterMessagePayload());

    expect([200, 201]).toContain(response.statusCode);

    expect(response.body).toHaveProperty(
      "message",
      "Message sent successfully."
    );
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toHaveProperty("formType", "newsletter");
    expect(response.body.data).toHaveProperty("createdAt");

    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("topics");

    const savedMessage = await Message.findById(response.body.data.id).lean();

    expect(savedMessage).toBeTruthy();
    expect(savedMessage.formType).toBe("newsletter");
    expect(savedMessage.email).toBe("newsletter@test.com");
    expect(savedMessage.firstName).toBe("Test");
    expect(savedMessage.lastName).toBe("Subscriber");
    expect(savedMessage.topics).toEqual(["newListings", "safetyCompliance"]);
    expect(savedMessage.agreeComm).toBe(true);
    expect(savedMessage.agreeNewsletter).toBe(true);
  });

  test("GET /messages rejects normal user", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app).get("/messages").set(authHeader(token));

    expect([401, 403]).toContain(response.statusCode);
  });

  test("GET /messages allows admin", async () => {
    const admin = await createAdminAndToken();

    await createMessageDoc({
      email: "stored@test.com",
    });

    const response = await request(app)
      .get("/messages")
      .set(authHeader(admin.token));

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  test("DELETE /messages/:messageId allows admin", async () => {
    const admin = await createAdminAndToken();

    const message = await createMessageDoc({
      email: "delete@test.com",
    });

    const response = await request(app)
      .delete(`/messages/${message._id}`)
      .set(authHeader(admin.token));

    expect([200, 204]).toContain(response.statusCode);

    const listResponse = await request(app)
      .get("/messages")
      .set(authHeader(admin.token));

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.length).toBe(0);
  });
});
