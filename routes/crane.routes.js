const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/jwt.middleware");

const {
  createCrane,
  getAllCranes,
  getCraneById,
  updateCrane,
  deleteCrane,
} = require("../controllers/crane.controller");

// Create a new crane
router.post("/", isAuthenticated, createCrane);

// Retrieve all cranes
router.get("/", getAllCranes);

// Retrive a specific crane (by id)
router.get("/:craneId", getCraneById);

// Update a specific crane (by id)
router.put("/:craneId", isAuthenticated, updateCrane);

// Delete a specific crane (by id)
router.delete("/:craneId", isAuthenticated, deleteCrane);

module.exports = router;
