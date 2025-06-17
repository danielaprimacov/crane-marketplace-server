const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Crane = require("../models/Crane.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Create a new crane
router.post("/cranes", isAuthenticated, async (req, res, next) => {
  try {
    const {
      title,
      images,
      description = "",
      price,
      location,
      status,
      availability,
    } = req.body;

    // the owner from req.user.id
    const owner = req.payload._id;

    const newCrane = await Crane.create({
      title,
      images,
      description,
      price,
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
router.get("/cranes", async (req, res, next) => {
  try {
    const allCranes = await Crane.find({});
    res.json(allCranes);
  } catch (error) {
    next(error);
  }
});

// Retrive a specific crane (by id)
router.get("/cranes/:craneId", async (req, res, next) => {
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
router.put("/cranes/:craneId", isAuthenticated, async (req, res, next) => {
  try {
    const { craneId } = req.params;
    const userId = req.payload._id;
    const {
      title,
      images,
      description,
      price,
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

    if (!crane.owner.equals(userId)) {
      return res
        .status(403)
        .json({ message: "You can only update your own crane" });
    }

    const updatedCrane = await Crane.findByIdAndUpdate(
      craneId,
      { title, images, description, price, location, status, availability },
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
router.delete("/cranes/:craneId", isAuthenticated, async (req, res, next) => {
  try {
    const { craneId } = req.params;
    const userId = req.payload._id;

    if (!mongoose.Types.ObjectId.isValid(craneId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const crane = await Crane.findById(craneId);
    if (!crane) {
      return res.status(404).json({ message: "Crane not found" });
    }

    if (!crane.owner.equals(userId)) {
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
