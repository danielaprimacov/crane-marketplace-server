require("dotenv").config();

const mongoose = require("mongoose");
const Message = require("../models/Message.model");
const Inquiry = require("../models/Inquiry.model");

const MONGODB_URI = process.env.MONGODB_URI;

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

async function cleanupOldPersonalData() {
  await mongoose.connect(MONGODB_URI);

  const oldMessagesResult = await Message.deleteMany({
    createdAt: { $lt: monthsAgo(12) },
  });

  const oldInquiriesResult = await Inquiry.deleteMany({
    createdAt: { $lt: monthsAgo(24) },
  });

  console.log("Old messages deleted:", oldMessagesResult.deletedCount);
  console.log("Old inquiries deleted:", oldInquiriesResult.deletedCount);

  await mongoose.connection.close();
}

cleanupOldPersonalData().catch(async (error) => {
  console.error("Cleanup failed:", error);
  await mongoose.connection.close();
  process.exit(1);
});
