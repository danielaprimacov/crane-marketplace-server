const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const inquirySchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    message: { type: String, required: true, trim: true, minlength: 5 },
    crane: {
      type: Schema.Types.ObjectId,
      ref: "Crane",
      required: true,
      index: true,
    },
    period: {
      from: { type: Date, required: false },
      to: { type: Date, required: false },
    },
    address: { type: String, required: false, trime: true },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
      required: true,
      index: true,
    },
    // Has the admin read this inquiry?
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Inquiry", inquirySchema);
