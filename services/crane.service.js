const mongoose = require("mongoose");

const AppError = require("../utils/AppError");
const Crane = require("../models/Crane.model");

const CRANE_ALLOWED_FIELDS = [
  "producer",
  "seriesCode",
  "capacityClassNumber",
  "capacity",
  "variantRevision",
  "radius",
  "height",
  "images",
  "description",
  "salePrice",
  "rentPrice",
  "location",
  "status",
  "availability",
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

async function findCraneByIdOrThrow(craneId) {
  if (!isValidObjectId(craneId)) {
    throw new AppError(400, "Specified id is not valid", "INVALID_CRANE_ID");
  }

  const crane = await Crane.findById(craneId);

  if (!crane) {
    throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
  }

  return crane;
}

async function createCrane(craneInput, ownerId) {
  const craneData = pickAllowedFields(craneInput, CRANE_ALLOWED_FIELDS);

  return Crane.create({
    ...craneData,
    description: craneData.description || "",
    owner: ownerId,
  });
}

async function getAllCranes() {
  return Crane.find({}).populate("owner", "name").sort({ createdAt: -1 });
}

async function getCraneById(craneId) {
  if (!isValidObjectId(craneId)) {
    throw new AppError(400, "Specified id is not valid", "INVALID_CRANE_ID");
  }

  const crane = await Crane.findById(craneId).populate("owner", "name");

  if (!crane) {
    throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
  }

  return crane;
}

async function updateCrane(craneId, craneInput) {
  const updateData = pickAllowedFields(craneInput, CRANE_ALLOWED_FIELDS);

  const updatedCrane = await Crane.findByIdAndUpdate(craneId, updateData, {
    new: true,
    runValidators: true,
  }).populate("owner", "name");

  if (!updatedCrane) {
    throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
  }

  return updatedCrane;
}

async function deleteCrane(craneId) {
  const deletedCrane = await Crane.findByIdAndDelete(craneId);

  if (!deletedCrane) {
    throw new AppError(404, "Crane not found", "CRANE_NOT_FOUND");
  }

  return deletedCrane;
}

module.exports = {
  findCraneByIdOrThrow,
  createCrane,
  getAllCranes,
  getCraneById,
  updateCrane,
  deleteCrane,
};
