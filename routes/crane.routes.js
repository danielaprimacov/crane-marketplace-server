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
  getMyCranes,
  updateCrane,
  deleteCrane,
} = require("../controllers/crane.controller");

// Retrieve all cranes - public crane route
router.get("/", getAllCranes);

//Authenticated owner routes
router.get("/my", isAuthenticated, getMyCranes);

// Create a new crane
router.post(
  "/",
  isAuthenticated,
  validateRequest(createCraneSchema),
  createCrane
);

// Retrive a specific crane (by id) - public crane detail route
router.get("/:craneId", validateRequest(craneIdParamSchema), getCraneById);

// Owner / admin crane management routes
// -- Update a specific crane (by id)
router.put(
  "/:craneId",
  isAuthenticated,
  validateRequest(updateCraneSchema),
  updateCrane
);

// -- Delete a specific crane (by id)
router.delete(
  "/:craneId",
  isAuthenticated,
  validateRequest(craneIdParamSchema),
  deleteCrane
);

module.exports = router;
