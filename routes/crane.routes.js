const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Crane = require("../models/Crane.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Create a new crane
router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    const {
      producer,
      seriesCode,
      capacityClassNumber,
      capacity,
      variantRevision,
      radius,
      height,
      images,
      description = "",
      salePrice,
      rentPrice,
      location,
      status,
      availability,
    } = req.body;

    // the owner from req.user.id
    const owner = req.payload._id;

    const newCrane = await Crane.create({
      producer,
      seriesCode,
      capacityClassNumber,
      capacity,
      variantRevision,
      radius,
      height,
      images,
      description,
      salePrice,
      rentPrice,
      location,
      status,
      availability,
      owner,
    });

    res.status(201).json(newCrane);
  } catch (error) {
    next(error);
  }
});

// Retrieve all cranes
router.get("/", async (req, res, next) => {
  try {
    const allCranes = await Crane.find({});
    res.json(allCranes);
  } catch (error) {
    next(error);
  }
});

// Retrive a specific crane (by id)
router.get("/:craneId", async (req, res, next) => {
  try {
    const { craneId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(craneId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const crane = await Crane.findById(craneId).populate("owner");
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    res.status(200).json(crane);
  } catch (error) {
    next(error);
  }
});

// Update a specific crane (by id)
router.put("/:craneId", isAuthenticated, async (req, res, next) => {
  try {
    const { craneId } = req.params;
    const userId = req.payload._id;
    const userRole = req.payload.role;

    const {
      producer,
      seriesCode,
      capacityClassNumber,
      capacity,
      variantRevision,
      radius,
      height,
      images,
      description,
      salePrice,
      rentPrice,
      location,
      status,
      availability,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(craneId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const crane = await Crane.findById(craneId);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    if (userRole !== "admin" && !crane.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You can only update your own crane" });
    }

    const updatedCrane = await Crane.findByIdAndUpdate(
      craneId,
      {
        producer,
        seriesCode,
        capacityClassNumber,
        capacity,
        variantRevision,
        radius,
        height,
        images,
        description,
        salePrice,
        rentPrice,
        location,
        status,
        availability,
      },
      { new: true, runValidators: true }
    );
    if (!updatedCrane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    res.status(200).json(updatedCrane);
  } catch (error) {
    next(error);
  }
});

// Delete a specific crane (by id)
router.delete("/:craneId", isAuthenticated, async (req, res, next) => {
  try {
    const { craneId } = req.params;
    const userId = req.payload._id;
    const userRole = req.payload.role;

    if (!mongoose.Types.ObjectId.isValid(craneId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const crane = await Crane.findById(craneId);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    if (userRole !== "admin" && !crane.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own crane" });
    }

    const deletedCrane = await Crane.findByIdAndDelete(craneId);
    if (!deletedCrane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    res
      .status(200)
      .json({ message: `Crane with ${craneId} was deleted successfully` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
