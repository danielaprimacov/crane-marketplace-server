const craneService = require("../services/crane.service");
const auditService = require("../services/audit.service");
const AUDIT_ACTIONS = require("../constants/auditActions");

const {
  toPublicCraneDto,
  toOwnerCraneDto,
  toAdminCraneDto,
} = require("../dtos/crane.dto");

const AppError = require("../utils/AppError");
const { canManageOwnedResource, getUserId } = require("../utils/permissions");

async function createCrane(req, res, next) {
  try {
    const newCrane = await craneService.createCrane(req.body, req.payload._id);

    await auditService.createAuditLog({
      ...auditService.getRequestAuditContext(req),
      action: AUDIT_ACTIONS.CRANE_CREATED,
      resourceType: "Crane",
      resourceId: newCrane._id,
      status: "success",
      metadata: {
        producer: newCrane.producer,
        seriesCode: newCrane.seriesCode,
        status: newCrane.status,
      },
    });

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

async function getMyCranes(req, res, next) {
  try {
    const ownerId = getUserId(req.payload);

    if (!ownerId) {
      throw new AppError(
        401,
        "Invalid authentication payload",
        "INVALID_AUTH_PAYLOAD"
      );
    }

    const cranes = await craneService.getCranesByOwner(ownerId);

    res.status(200).json(cranes.map(toOwnerCraneDto));
  } catch (error) {
    next(error);
  }
}

async function getAdminCranes(req, res, next) {
  try {
    const cranes = await craneService.getAllCranesForAdmin();

    await auditService.createAuditLog({
      ...auditService.getRequestAuditContext(req),
      action: AUDIT_ACTIONS.ADMIN_CRANE_LIST_VIEWED,
      resourceType: "Crane",
      status: "success",
      metadata: {
        resultCount: cranes.length,
      },
    });

    res.status(200).json(cranes.map(toAdminCraneDto));
  } catch (error) {
    next(error);
  }
}

async function updateCrane(req, res, next) {
  try {
    const { craneId } = req.params;

    const crane = await craneService.findCraneByIdOrThrow(craneId);

    if (!canManageOwnedResource(req.payload, crane.owner)) {
      await auditService.createAuditLog({
        ...auditService.getRequestAuditContext(req),
        action: AUDIT_ACTIONS.FORBIDDEN_CRANE_UPDATE,
        resourceType: "Crane",
        resourceId: crane._id,
        status: "failure",
        metadata: {
          reason: "User attempted to update a crane they do not own",
        },
      });

      throw new AppError(
        403,
        "You can only update your own crane",
        "FORBIDDEN_CRANE_UPDATE"
      );
    }

    const updatedCrane = await craneService.updateCrane(craneId, req.body);

    await auditService.createAuditLog({
      ...auditService.getRequestAuditContext(req),
      action: AUDIT_ACTIONS.CRANE_UPDATED,
      resourceType: "Crane",
      resourceId: updatedCrane._id,
      status: "success",
      metadata: {
        updatedFields: Object.keys(req.body),
      },
    });

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
      await auditService.createAuditLog({
        ...auditService.getRequestAuditContext(req),
        action: AUDIT_ACTIONS.FORBIDDEN_CRANE_DELETE,
        resourceType: "Crane",
        resourceId: crane._id,
        status: "failure",
        metadata: {
          reason: "User attempted to delete a crane they do not own",
        },
      });

      throw new AppError(
        403,
        "You can only delete your own crane",
        "FORBIDDEN_CRANE_DELETE"
      );
    }

    await craneService.deleteCrane(craneId);

    await auditService.createAuditLog({
      ...auditService.getRequestAuditContext(req),
      action: AUDIT_ACTIONS.CRANE_DELETED,
      resourceType: "Crane",
      resourceId: crane._id,
      status: "success",
      metadata: {
        producer: crane.producer,
        seriesCode: crane.seriesCode,
        status: crane.status,
      },
    });

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
  getMyCranes,
  getAdminCranes,
  updateCrane,
  deleteCrane,
};
