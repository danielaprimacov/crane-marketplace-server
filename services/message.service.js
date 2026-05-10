const Message = require("../models/Message.model");
const AppError = require("../utils/AppError");

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

    console.warn("RECAPTCHA_SECRET_KEY is missing. Skipping captcha in dev.");
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

function buildMessagePayload(input) {
  const payload = { ...input };

  delete payload.website;
  delete payload.recaptchaToken;

  if (payload.formType === "newsletter") {
    payload.recaptchaVerified = false;
    payload.consentTimestamp = null;
  }

  return payload;
}

async function createMessage(input) {
  if (input.website) {
    return {
      honeypotTriggered: true,
      message: null,
    };
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

module.exports = { createMessage, getAllMessages, deleteMessage };
