const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../../app");

const User = require("../../models/User.model");
const Crane = require("../../models/Crane.model");
const Inquiry = require("../../models/Inquiry.model");
const Message = require("../../models/Message.model");

const ROLES = require("../../constants/roles");

const TEST_PASSWORD = "Test123456!";

function getTokenFromResponse(response) {
  return response.body.authToken || response.body.token;
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function createUser({
  name = "Test User",
  email = "user@test.com",
  password = TEST_PASSWORD,
  role = ROLES.USER,
  termsAcceptedAt = new Date(),
  privacyPolicyAcceptedAt = new Date(),
  privacyPolicyVersion = "2026-05",
  marketingConsent = false,
  marketingConsentAt = null,
} = {}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    name,
    email,
    password: hashedPassword,
    role,
    privacy: {
      termsAcceptedAt,
      privacyPolicyAcceptedAt,
      privacyPolicyVersion,
      marketingConsent,
      marketingConsentAt: marketingConsent
        ? marketingConsentAt || new Date()
        : null,
      consentSource: "signup_form",
    },
  });
}

async function loginUser({
  email = "user@test.com",
  password = TEST_PASSWORD,
} = {}) {
  const response = await request(app).post("/auth/login").send({
    email,
    password,
  });

  return {
    response,
    token: getTokenFromResponse(response),
  };
}

async function createUserAndToken({
  name = "Test User",
  email = "user@test.com",
  password = TEST_PASSWORD,
  role = ROLES.USER,
} = {}) {
  const user = await createUser({
    name,
    email,
    password,
    role,
  });

  const { response, token } = await loginUser({
    email,
    password,
  });

  return {
    user,
    response,
    token,
  };
}

async function createAdminAndToken({
  name = "Test Admin",
  email = "admin@test.com",
  password = TEST_PASSWORD,
} = {}) {
  return createUserAndToken({
    name,
    email,
    password,
    role: ROLES.ADMIN,
  });
}

function buildCranePayload(overrides = {}) {
  return {
    producer: "Liebherr",
    seriesCode: "200 EC-H",
    capacityClassNumber: 10,
    capacity: 10,
    radius: 60,
    height: 65,
    variantRevision: "Litronic",
    images: [
      "https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?q=80&w=1200&auto=format&fit=crop",
    ],
    description: "Test crane for integration tests.",
    rentPrice: {
      amount: 2800,
      interval: "month",
    },
    location: "Berlin, Germany",
    status: "for rent",
    availability: {},
    ...overrides,
  };
}

async function createCraneDoc(ownerId, overrides = {}) {
  return Crane.create({
    ...buildCranePayload(overrides),
    owner: ownerId,
  });
}

function buildInquiryPayload(craneId, overrides = {}) {
  return {
    customerName: "Test Customer",
    email: "customer@test.com",
    message: "We need more information about this crane.",
    crane: craneId,
    period: {
      from: "2026-07-01",
      to: "2026-09-30",
    },
    address: "Alexanderplatz 1, 10178 Berlin",
    needsTransport: true,
    needsInstallation: true,
    ...overrides,
  };
}

async function createInquiryDoc(craneId, overrides = {}) {
  return Inquiry.create({
    ...buildInquiryPayload(craneId, overrides),
    status: overrides.status || "new",
    isRead: overrides.isRead ?? false,
  });
}

function buildContactMessagePayload(overrides = {}) {
  return {
    formType: "contact",
    salutation: "Mr.",
    firstName: "Test",
    lastName: "Contact",
    email: "contact@test.com",
    phone: "+49 111 111111",
    country: "Germany",
    message: "I would like to know more about your crane services.",
    website: "",
    ...overrides,
  };
}

function buildExpertMessagePayload(overrides = {}) {
  return {
    formType: "expert",
    name: "Test Expert Request",
    company: "Test Construction GmbH",
    email: "expert@test.com",
    phone: "+49 222 222222",
    projectDetails:
      "We need help choosing a crane for a 7-floor building project.",
    website: "",
    ...overrides,
  };
}

function buildNewsletterMessagePayload(overrides = {}) {
  return {
    formType: "newsletter",
    firstName: "Test",
    lastName: "Subscriber",
    email: "newsletter@test.com",
    phone: "+49 333 333333",
    topics: ["newListings", "safetyCompliance"],
    agreeComm: true,
    agreeNewsletter: true,
    recaptchaToken: "test-token",
    website: "",
    ...overrides,
  };
}

async function createMessageDoc(overrides = {}) {
  return Message.create({
    ...buildContactMessagePayload(overrides),
  });
}

function getId(documentOrResponseBody) {
  return documentOrResponseBody.id || documentOrResponseBody._id;
}

module.exports = {
  TEST_PASSWORD,
  authHeader,
  createUser,
  loginUser,
  createUserAndToken,
  createAdminAndToken,
  buildCranePayload,
  createCraneDoc,
  buildInquiryPayload,
  createInquiryDoc,
  buildContactMessagePayload,
  buildExpertMessagePayload,
  buildNewsletterMessagePayload,
  createMessageDoc,
  getId,
};
