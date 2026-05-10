const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    formType: {
      type: String,
      enum: ["contact", "expert", "newsletter"],
      required: true,
      index: true,
    },
    // common fields
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    phone: { type: String, trim: true },

    // contact-form fields
    salutation: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    country: { type: String, trim: true },
    message: { type: String, trim: true },

    // expert-advice fields
    name: { type: String, trim: true },
    company: { type: String, trim: true },
    projectDetails: { type: String, trim: true },

    // newsletter fields
    topics: {
      type: [String],
      enum: [
        "newListings",
        "industryInsights",
        "safetyCompliance",
        "maintenanceService",
        "financingLeasing",
      ],
      default: [],
    },

    agreeComm: {
      type: Boolean,
      default: false,
    },

    agreeNewsletter: {
      type: Boolean,
      default: false,
    },

    recaptchaVerified: {
      type: Boolean,
      default: false,
    },

    consentTimestamp: {
      type: Date,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", messageSchema);
