const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/jwt.middleware");
const validateRequest = require("../middleware/validateRequest.middleware");

const {
  createCraneSchema,
  updateCraneSchema,
  craneIdParamSchema,
} = require("../validations/crane.validation");

const {
  createCrane,
  getAllCranes,
  getCraneById,
  updateCrane,
  deleteCrane,
} = require("../controllers/crane.controller");

// Create a new crane
router.post(
  "/",
  isAuthenticated,
  validateRequest(createCraneSchema),
  createCrane
);

// Retrieve all cranes
router.get("/", getAllCranes);

// Retrive a specific crane (by id)
router.get("/:craneId", validateRequest(craneIdParamSchema), getCraneById);

// Update a specific crane (by id)
router.put(
  "/:craneId",
  isAuthenticated,
  validateRequest(updateCraneSchema),
  updateCrane
);

// Delete a specific crane (by id)
router.delete(
  "/:craneId",
  isAuthenticated,
  validateRequest(craneIdParamSchema),
  deleteCrane
);

module.exports = router;
