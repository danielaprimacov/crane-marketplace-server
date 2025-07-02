const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const craneSchema = new Schema(
  {
    producer: { type: String, required: true, index: true },
    seriesCode: {
      type: String,
      required: true,
      trim: true,
      decription: "Series or type Code (e.g. 'LTM', 'AC', 'MD')",
    },
    capacityClassNumber: {
      type: Number,
      required: true,
      min: 0,
      description: "Capacity or class number in tonnes (e.g. 100)",
    },
    variantRevision: {
      type: String,
      default: "",
      trim: true,
      description: "Variant or revision code (e.g. '5.2', '4L', 'B')",
    },
    images: { type: [String], required: true, validate: (v) => v.length > 0 },
    description: { type: String, default: "" },
    salePrice: {
      type: Number,
      min: 0,
      required: [
        function () {
          return this.status === "for sale";
        },
        "salePrice is required when status is 'for sale'",
      ],
    },
    rentPrice: {
      amount: {
        type: Number,
        min: 0,
        required: [
          function () {
            return this.status === "for rent";
          },
          "rentPrice.amount is required when status is 'for rent'",
        ],
      },
      interval: {
        type: String,
        enum: ["hour", "day", "week", "month"],
        required: [
          function () {
            return this.status === "for rent";
          },
          "rentPrice.interval (e.g. 'day' or 'month') is required when status is 'for rent'",
        ],
      },
    },
    location: { type: String, require: true, index: true },
    status: { type: String, enum: ["for sale", "for rent"], required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    availability: { from: { type: Date }, to: { type: Date } },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual to assemble the full title
craneSchema.virtual("title").get(function () {
  const parts = [
    this.producer,
    this.seriesCode,
    this.capacityClassNumber,
    this.variantRevision,
  ].filter(Boolean);
  return parts.join(" ");
});

module.exports = model("Crane", craneSchema);
