const express = require("express");
const router = express.Router();

const Message = require("../models/Message.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const ALLOWED_FORM_TYPES = ["contact", "expert", "newsletter"];

const NEWSLETTER_TOPICS = [
  "newListings",
  "industryInsights",
  "safetyCompliance",
  "maintenanceService",
  "financingLeasing",
];

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value) {
  return value === true || value === "true";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RECAPTCHA_SECRET_KEY is not configured.");
    }

    console.warn("RECAPTCHA_SECRET_KEY is missing. Skipping captcha in dev.");
    return true;
  }

  if (!token) return false;

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token);

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body: params,
    }
  );

  const data = await response.json();

  return Boolean(data.success);
}

function validateContactMessage(body) {
  const payload = {
    formType: "contact",
    salutation: normalizeString(body.salutation),
    firstName: normalizeString(body.firstName),
    lastName: normalizeString(body.lastName),
    email: normalizeString(body.email).toLowerCase(),
    country: normalizeString(body.country),
    phone: normalizeString(body.phone),
    message: normalizeString(body.message),
  };

  if (!payload.salutation) return { error: "Salutation is required." };
  if (!payload.firstName) return { error: "First name is required." };
  if (!payload.lastName) return { error: "Last name is required." };
  if (!payload.email) return { error: "Email is required." };
  if (!isValidEmail(payload.email)) return { error: "Email is invalid." };
  if (!payload.country) return { error: "Country is required." };
  if (!payload.message) return { error: "Message is required." };

  return { payload };
}

function validateExpertMessage(body) {
  const payload = {
    formType: "expert",
    name: normalizeString(body.name),
    company: normalizeString(body.company),
    email: normalizeString(body.email).toLowerCase(),
    phone: normalizeString(body.phone),
    projectDetails: normalizeString(body.projectDetails),
  };

  if (!payload.name) return { error: "Name is required." };
  if (!payload.email) return { error: "Email is required." };
  if (!isValidEmail(payload.email)) return { error: "Email is invalid." };
  if (!payload.projectDetails) {
    return { error: "Project details are required." };
  }

  return { payload };
}

function validateNewsletterMessage(body) {
  const rawTopics = Array.isArray(body.topics) ? body.topics : [];

  const selectedTopics = rawTopics.filter((topic) =>
    NEWSLETTER_TOPICS.includes(topic)
  );

  const payload = {
    formType: "newsletter",
    firstName: normalizeString(body.firstName),
    lastName: normalizeString(body.lastName),
    email: normalizeString(body.email).toLowerCase(),
    phone: normalizeString(body.phone),
    topics: selectedTopics,
    agreeComm: normalizeBoolean(body.agreeComm),
    agreeNewsletter: normalizeBoolean(body.agreeNewsletter),
    recaptchaVerified: false,
  };

  if (!payload.firstName) return { error: "First name is required." };
  if (!payload.lastName) return { error: "Last name is required." };
  if (!payload.email) return { error: "Email is required." };
  if (!isValidEmail(payload.email)) return { error: "Email is invalid." };

  if (payload.topics.length === 0) {
    return { error: "Please select at least one newsletter topic." };
  }

  if (!payload.agreeComm) {
    return {
      error: "Communication consent is required.",
    };
  }

  if (!payload.agreeNewsletter) {
    return {
      error: "Newsletter consent is required.",
    };
  }

  return { payload };
}

function validateMessageByType(body) {
  const formType = normalizeString(body.formType);

  if (!ALLOWED_FORM_TYPES.includes(formType)) {
    return { error: "Invalid form type." };
  }

  if (formType === "contact") {
    return validateContactMessage(body);
  }

  if (formType === "expert") {
    return validateExpertMessage(body);
  }

  if (formType === "newsletter") {
    return validateNewsletterMessage(body);
  }

  return { error: "Invalid form type." };
}

router.get("/", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const all = await Message.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = req.body || {};

    // Honeypot: bots often fill hidden fields.
    // We pretend success, but store nothing.
    if (normalizeString(body.website)) {
      return res.status(200).json({
        message: "Message accepted.",
      });
    }

    const { error, payload } = validateMessageByType(body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (payload.formType === "newsletter") {
      const captchaOk = await verifyRecaptcha(body.recaptchaToken);

      if (!captchaOk) {
        return res.status(400).json({
          message: "reCAPTCHA verification failed.",
        });
      }

      payload.recaptchaVerified = true;
      payload.consentTimestamp = new Date();
    }

    const msg = await Message.create(payload);

    res.status(201).json({
      message: "Message sent successfully.",
      data: msg,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
