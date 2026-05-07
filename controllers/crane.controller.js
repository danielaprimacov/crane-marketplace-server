const mongoose = require("mongoose");

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

async function findCraneOrReturnError(craneId, res) {
  if (!isValidObjectId(craneId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return null;
  }

  const crane = await Crane.findById(craneId);

  if (!crane) {
    res.status(404).json({ message: "Crane not found" });
    return null;
  }

  return crane;
}

function canManageCrane(user, crane) {
  if (!user || !crane) return false;

  const userId = user._id;
  const userRole = user.role;

  return userRole === "admin" || crane.owner.equals(userId);
}

async function createCrane(req, res, next) {
  try {
    const craneData = pickAllowedFields(req.body, CRANE_ALLOWED_FIELDS);

    const newCrane = await Crane.create({
      ...craneData,
      description: craneData.description || "",
      owner: req.payload._id,
    });

    res.status(201).json(newCrane);
  } catch (error) {
    next(error);
  }
}

async function getAllCranes(req, res, next) {
  try {
    const allCranes = await Crane.find({})
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(allCranes);
  } catch (error) {
    next(error);
  }
}

async function getCraneById(req, res, next) {
  try {
    const { craneId } = req.params;

    if (!isValidObjectId(craneId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const crane = await Crane.findById(craneId).populate("owner", "name");

    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    res.status(200).json(crane);
  } catch (error) {
    next(error);
  }
}

async function updateCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await findCraneOrReturnError(craneId, res);
    if (!crane) return;

    if (!canManageCrane(req.payload, crane)) {
      return res
        .status(403)
        .json({ message: "You can only update your own crane" });
    }

    const updateData = pickAllowedFields(req.body, CRANE_ALLOWED_FIELDS);

    const updatedCrane = await Crane.findByIdAndUpdate(craneId, updateData, {
      new: true,
      runValidators: true,
    }).populate("owner", "name");

    res.status(200).json(updatedCrane);
  } catch (error) {
    next(error);
  }
}

async function deleteCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await findCraneOrReturnError(craneId, res);
    if (!crane) return;

    if (!canManageCrane(req.payload, crane)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own crane" });
    }

    await Crane.findByIdAndDelete(craneId);

    res.status(200).json({
      message: `Crane with id ${craneId} was deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCrane,
  getAllCranes,
  getCraneById,
  updateCrane,
  deleteCrane,
};
