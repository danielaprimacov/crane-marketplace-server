const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    formType: {
      type: String,
      enum: ["contact", "expert"],
      required: true,
    },
    // common fields
    email: { type: String, required: true },
    phone: { type: String },

    // contact-form fields
    salutation: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    message: { type: String },

    // expert-advice fields
    name: { type: String },
    company: { type: String },
    projectDetails: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", messageSchema);
