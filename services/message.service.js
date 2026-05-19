const Message = require("../models/Message.model");
const AppError = require("../utils/AppError");

const PRIVACY_POLICY_VERSION = "2026-05";

async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        500,
        "reCAPTCHA is not configured",
        "RECAPTCHA_NOT_CONFIGURED"
      );
    }

    if (process.env.NODE_ENV !== "test") {
      console.warn("RECAPTCHA_SECRET_KEY is missing. Skipping captcha in dev.");
    }

    return true;
  }

  if (!token) {
    return false;
  }

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

function validateNewsletterInput(input) {
  if (!input.agreeNewsletter) {
    throw new AppError(
      400,
      "Newsletter consent is required.",
      "NEWSLETTER_CONSENT_REQUIRED"
    );
  }

  if (!Array.isArray(input.topics) || input.topics.length === 0) {
    throw new AppError(
      400,
      "At least one newsletter topic is required.",
      "NEWSLETTER_TOPIC_REQUIRED"
    );
  }
}

function buildMessagePayload(input) {
  const payload = { ...input };

  delete payload.website;
  delete payload.recaptchaToken;

  if (payload.formType === "newsletter") {
    payload.agreeNewsletter = Boolean(input.agreeNewsletter);
    payload.agreeComm = Boolean(input.agreeComm);

    payload.recaptchaVerified = false;

    // Set on backend after validation.
    payload.consentTimestamp = null;

    payload.privacyPolicyVersion =
      input.privacyPolicyVersion || PRIVACY_POLICY_VERSION;

    payload.consentSource = input.consentSource || "newsletter_form";

    // Until real double opt-in is implemented.
    payload.subscriptionStatus = "pending";
  } else {
    // Non-newsletter messages should not accidentally carry newsletter consent metadata.
    delete payload.topics;
    delete payload.agreeNewsletter;
    delete payload.consentTimestamp;
    delete payload.privacyPolicyVersion;
    delete payload.consentSource;
    delete payload.subscriptionStatus;

    payload.agreeComm = Boolean(input.agreeComm);
  }

  return payload;
}

async function createMessage(input) {
  // Honeypot: pretend success, but do not save spam.
  if (input.website) {
    return {
      honeypotTriggered: true,
      message: null,
    };
  }

  if (input.formType === "newsletter") {
    validateNewsletterInput(input);
  }

  const payload = buildMessagePayload(input);

  if (payload.formType === "newsletter") {
    const captchaOk = await verifyRecaptcha(input.recaptchaToken);

    if (!captchaOk) {
      throw new AppError(
        400,
        "reCAPTCHA verification failed",
        "RECAPTCHA_FAILED"
      );
    }

    payload.recaptchaVerified = true;
    payload.consentTimestamp = new Date();
  }

  const message = await Message.create(payload);

  return {
    honeypotTriggered: false,
    message,
  };
}

async function getAllMessages() {
  return Message.find({}).sort({ createdAt: -1 });
}

async function deleteMessage(messageId) {
  const deletedMessage = await Message.findByIdAndDelete(messageId);

  if (!deletedMessage) {
    throw new AppError(404, "Message not found", "MESSAGE_NOT_FOUND");
  }

  return deletedMessage;
}

module.exports = {
  createMessage,
  getAllMessages,
  deleteMessage,
};
