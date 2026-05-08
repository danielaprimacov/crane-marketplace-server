const craneService = require("../services/crane.service");

const { toPublicCraneDto, toOwnerCraneDto } = require("../dtos/crane.dto");

const AppError = require("../utils/AppError");
const { canManageOwnedResource } = require("../utils/permissions");

async function createCrane(req, res, next) {
  try {
    const newCrane = await craneService.createCrane(req.body, req.payload._id);

    res.status(201).json(toOwnerCraneDto(newCrane));
  } catch (error) {
    next(error);
  }
}

async function getAllCranes(req, res, next) {
  try {
    const allCranes = await craneService.getAllCranes();

    res.status(200).json(allCranes.map(toPublicCraneDto));
  } catch (error) {
    next(error);
  }
}

async function getCraneById(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.getCraneById(craneId);

    res.status(200).json(toPublicCraneDto(crane));
  } catch (error) {
    next(error);
  }
}

async function updateCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.findCraneByIdOrThrow(craneId);

    if (!canManageOwnedResource(req.payload, crane.owner)) {
      throw new AppError(
        403,
        "You can only update your own crane",
        "FORBIDDEN_CRANE_UPDATE"
      );
    }

    const updatedCrane = await craneService.updateCrane(craneId, req.body);

    res.status(200).json(toOwnerCraneDto(updatedCrane));
  } catch (error) {
    next(error);
  }
}

async function deleteCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.findCraneByIdOrThrow(craneId);

    if (!canManageOwnedResource(req.payload, crane.owner)) {
      throw new AppError(
        403,
        "You can only delete your own crane",
        "FORBIDDEN_CRANE_DELETE"
      );
    }

    await craneService.deleteCrane(craneId);

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
