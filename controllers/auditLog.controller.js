const auditService = require("../services/audit.service");
const { toAuditLogDto } = require("../dtos/auditLog.dto");

async function getAdminAuditLogs(req, res, next) {
  try {
    const logs = await auditService.getAuditLogs({ limit: 100 });

    res.status(200).json(logs.map(toAuditLogDto));
  } catch (error) {
    next(error);
  }
}

module.exports = { getAdminAuditLogs };
