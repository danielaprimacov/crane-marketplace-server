const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const ROLES = require("../constants/roles");

const {
  createMessageSchema,
  messageIdParamSchema,
} = require("../validations/message.validation");

const {
  getAdminMessages,
  createMessage,
  deleteAdminMessage,
} = require("../controllers/message.controller");

const router = express.Router();

router.get("/", isAuthenticated, requireRole(ROLES.ADMIN), getAdminMessages);

router.post("/", validateRequest(createMessageSchema), createMessage);

router.delete(
  "/:id",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  validateRequest(messageIdParamSchema),
  deleteAdminMessage
);

module.exports = router;
