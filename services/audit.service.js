const AuditLog = require("../models/AuditLog.model");

async function createAuditLog({
  actor = null,
  action,
  resourceType,
  resourceId = null,
  status,
  ipAddress = null,
  userAgent = null,
  metadata = {},
}) {
  try {
    await AuditLog.create({
      actor,
      action,
      resourceType,
      resourceId,
      status,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    // Audit logging should not crash the main request.
    console.error("Audit log failed:", error);
  }
}

function getRequestAuditContext(req) {
  return {
    actor: req.payload?._id || req.payload?.id || req.payload?.userId || null,
    ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
    userAgent: req.headers["user-agent"] || null,
  };
}

async function getAuditLogs({ limit = 100 } = {}) {
  return AuditLog.find({})
    .populate("actor", "name email role")
    .sort({ createdAd: -1 })
    .limit(limit);
}

module.exports = { createAuditLog, getRequestAuditContext, getAuditLogs };
