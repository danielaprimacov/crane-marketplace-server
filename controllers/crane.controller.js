const craneService = require("../services/crane.service");

function canManageCrane(user, crane) {
  if (!user || !crane) return false;

  const userId = user._id;
  const userRole = user.role;

  return userRole === "admin" || crane.owner.equals(userId);
}

async function createCrane(req, res, next) {
  try {
    const newCrane = await craneService.createCrane(req.body, req.payload._id);

    res.status(201).json(newCrane);
  } catch (error) {
    next(error);
  }
}

async function getAllCranes(req, res, next) {
  try {
    const allCranes = await craneService.getAllCranes();

    res.status(200).json(allCranes);
  } catch (error) {
    next(error);
  }
}

async function getCraneById(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.getCraneById(craneId);

    res.status(200).json(crane);
  } catch (error) {
    next(error);
  }
}

async function updateCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.findCraneByIdOrThrow(craneId);

    if (!canManageCrane(req.payload, crane)) {
      return res
        .status(403)
        .json({ message: "You can only update your own crane" });
    }

    const updatedCrane = await craneService.updateCrane(craneId, req.body);

    res.status(200).json(updatedCrane);
  } catch (error) {
    next(error);
  }
}

async function deleteCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.findCraneByIdOrThrow(craneId);

    if (!canManageCrane(req.payload, crane)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own crane" });
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
