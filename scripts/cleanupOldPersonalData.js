require("dotenv").config();

const mongoose = require("mongoose");

const Message = require("../models/Message.model");
const Inquiry = require("../models/Inquiry.model");

const MONGODB_URI = process.env.MONGODB_URI;
const ALLOW_PERSONAL_DATA_CLEANUP =
  process.env.ALLOW_PERSONAL_DATA_CLEANUP === "true";

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

async function cleanupOldPersonalData() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (process.env.NODE_ENV === "production" && !ALLOW_PERSONAL_DATA_CLEANUP) {
    throw new Error(
      "Refusing to cleanup production data without ALLOW_PERSONAL_DATA_CLEANUP=true."
    );
  }

  await mongoose.connect(MONGODB_URI);

  const oldContactAndExpertMessagesResult = await Message.deleteMany({
    formType: { $in: ["contact", "expert"] },
    createdAt: { $lt: monthsAgo(12) },
  });

  const oldInquiriesResult = await Inquiry.deleteMany({
    createdAt: { $lt: monthsAgo(24) },
  });

  console.log(
    "Old contact/expert messages deleted:",
    oldContactAndExpertMessagesResult.deletedCount
  );

  console.log("Old inquiries deleted:", oldInquiriesResult.deletedCount);

  await mongoose.connection.close();
}

cleanupOldPersonalData().catch(async (error) => {
  console.error("Cleanup failed:", error);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  process.exit(1);
});
