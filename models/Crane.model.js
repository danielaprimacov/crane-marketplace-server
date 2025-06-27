const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const craneSchema = new Schema(
  {
    title: { type: String, required: true },
    producer: { type: String, required: true, index: true },
    images: { type: [String], required: true, validate: (v) => v.length > 0 },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, require: true, index: true },
    status: { type: String, enum: ["for sale", "for rent"], required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    availability: { from: { type: Date }, to: { type: Date } },
  },
  { timestamps: true }
);

module.exports = model("Crane", craneSchema);
