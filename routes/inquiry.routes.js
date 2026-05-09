const express = require("express");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const requireRole = require("../middleware/requireRole.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");
const ROLES = require("../constants/roles");

const {
  createInquirySchema,
  updateInquirySchema,
  inquiryIdParamSchema,
} = require("../validations/inquiry.validation");

const {
  createInquiry,
  getAdminInquiries,
  getAdminInquiryById,
  updateAdminInquiry,
  deleteAdminInquiry,
} = require("../controllers/inquiry.controller");

const router = express.Router();

// Create a new inquiry
router.post("/", validateRequest(createInquirySchema), createInquiry);

// Retrieve all inquiries
router.get("/", isAuthenticated, requireRole(ROLES.ADMIN), getAdminInquiries);

// Retrieve a secific inquiry (by id)
router.get(
  "/:inquiryId",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  validateRequest(inquiryIdParamSchema)
);

// Update a specific inquiry (by id)
router.put(
  "/:inquiryId",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  validateRequest(updateInquirySchema)
);

// Delete a specific inquiry (by id)
router.delete(
  "/:inquiryId",
  isAuthenticated,
  requireRole(ROLES.ADMIN),
  validateRequest(inquiryIdParamSchema),
  deleteAdminInquiry
);

module.exports = router;
