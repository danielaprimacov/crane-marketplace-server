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
} = require("../helpers/testFactory");

const AuditLog = require("../../models/AuditLog.model");

const AUDIT_LOGS_ROUTE = "/admin/audit-logs";

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Admin/Audit API", () => {
  test("GET audit logs rejects unauthenticated request", async () => {
    const response = await request(app).get(AUDIT_LOGS_ROUTE);

    expect(response.statusCode).toBeGreaterThanOrEqual(401);
  });

  test("GET audit logs rejects normal user", async () => {
    const { token } = await createUserAndToken();

    const response = await request(app)
      .get(AUDIT_LOGS_ROUTE)
      .set(authHeader(token));

    expect([401, 403]).toContain(response.statusCode);
  });

  test("GET audit logs allows admin", async () => {
    const admin = await createAdminAndToken();

    await AuditLog.create({
      action: "TEST_ACTION",
      actor: admin.user._id,

      resourceType: "User",
      resourceId: admin.user._id,

      status: "success",

      metadata: {
        source: "integration-test",
      },
    });

    const response = await request(app)
      .get(AUDIT_LOGS_ROUTE)
      .set(authHeader(admin.token));

    expect(response.statusCode).toBe(200);

    const auditLogs = Array.isArray(response.body)
      ? response.body
      : response.body.data;

    expect(Array.isArray(auditLogs)).toBe(true);
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0]).toHaveProperty("action", "TEST_ACTION");
    expect(auditLogs[0]).toHaveProperty("resourceType", "User");
    expect(auditLogs[0]).toHaveProperty("status", "success");
  });
});
