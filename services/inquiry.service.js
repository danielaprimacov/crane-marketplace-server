const mongoose = require("mongoose");

const Inquiry = require("../models/Inquiry.model");
const Crane = require("../models/Crane.model");
const AppError = require("../utils/AppError");

const INQUIRY_ALLOWED_FIELDS = [
  "customerName",
  "email",
  "message",
  "crane",
  "period",
  "address",
  "needsTransport",
  "needsInstallation",
  "status",
  "isRead",
];

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickAllowedFields(source, allowedFields) {
  return allowedFields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = source[field];
    }

    return result;
  }, {});
}

async function ensureCraneExists(craneId) {
  if (!isValidObjectId(craneId)) {
    throw new AppError(400, "Invalid crane ID", "INVALID_CRANE_ID");
  }

  const crane = await Crane.findById(craneId);

  if (!crane) {
    throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
  }

  return crane;
}

async function findInquiryByIdOrThrow(inquiryId) {
  if (!isValidObjectId(inquiryId)) {
    throw new AppError(400, "Specified id is not valid", "INVALID_INQUIRY_ID");
  }

  const inquiry = await Inquiry.findById(inquiryId).populate({
    path: "crane",
    select:
      "producer seriesCode capacityClassNumber variantRevision status location owner",
  });

  if (!inquiry) {
    throw new AppError(404, "Inquiry not found", "INQUIRY_NOT_FOUND");
  }

  return inquiry;
}

async function createInquiry(inquiryInput) {
  const inquiryData = pickAllowedFields(inquiryInput, INQUIRY_ALLOWED_FIELDS);

  await ensureCraneExists(inquiryData.crane);

  return Inquiry.create({ ...inquiryData, status: "new", isRead: false });
}

async function getAllInquiriesForAdmin() {
  return Inquiry.find({})
    .populate({
      path: "crane",
      select:
        "producer seriesCode capacityClassNumber variantRevision status location owner",
    })
    .sort({ createdAt: -1 });
}

async function getInquiryByIdForAdmin(inquiryId) {
  return findInquiryByIdOrThrow(inquiryId);
}

async function updateInquiry(inquiryId, inquiryInput) {
  if (!isValidObjectId(inquiryId)) {
    throw new AppError(400, "Specified id is not valid", "INVALID_INQUIRY_ID");
  }

  const updateData = pickAllowedFields(inquiryInput, INQUIRY_ALLOWED_FIELDS);

  if (updateData.crane) {
    await ensureCraneExists(updateData.crane);
  }

  const updatedInquiry = await Inquiry.findByIdAndUpdate(
    inquiryId,
    updateData,
    { new: true, runValidators: true }
  ).populate({
    path: "crane",
    select:
      "producer seriesCode capacityClassNumber variantRevision status location owner",
  });

  if (!updatedInquiry) {
    throw new AppError(404, "Inquiry not found", "INQUIRY_NOT_FOUND");
  }

  return updatedInquiry;
}

async function deleteInquiry(inquiryId) {
  if (!isValidObjectId(inquiryId)) {
    throw new AppError(400, "Specified id is not valid", "INVALID_INQUIRY_ID");
  }

  const deletedInquiry = await Inquiry.findByIdAndDelete(inquiryId);

  if (!deletedInquiry) {
    throw new AppError(404, "Inquiry not found", "INQUIRY_NOT_FOUND");
  }

  return deletedInquiry;
}

module.exports = {
  createInquiry,
  getAllInquiriesForAdmin,
  getInquiryByIdForAdmin,
  updateInquiry,
  deleteInquiry,
};
