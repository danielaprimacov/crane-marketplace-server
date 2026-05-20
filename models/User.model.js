const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ROLES = require("../constants/roles");

const PRIVACY_POLICY_VERSION = "2026-05";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    privacy: {
      termsAcceptedAt: {
        type: Date,
        default: null,
      },

      privacyPolicyAcceptedAt: {
        type: Date,
        default: null,
      },

      privacyPolicyVersion: {
        type: String,
        default: PRIVACY_POLICY_VERSION,
        trim: true,
      },

      marketingConsent: {
        type: Boolean,
        default: false,
      },

      marketingConsentAt: {
        type: Date,
        default: null,
      },

      consentSource: {
        type: String,
        enum: ["signup_form", "admin_created", "migration"],
        default: "signup_form",
      },
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
