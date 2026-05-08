function toAuditLogDto(log) {
  return {
    id: log._id.toString(),

    actor: log.actor
      ? {
          id: log.actor._id?.toString(),
          name: log.actor.name,
          email: log.actor.email,
          role: log.actor.role,
        }
      : null,

    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId?.toString() || null,
    status: log.status,

    ipAddress: log.ipAddress,
    userAgent: log.userAgent,

    metadata: log.metadata || {},

    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

module.exports = { toAuditLogDto };
