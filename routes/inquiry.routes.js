const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Inquiry = require("../models/Inquiry.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Create a new inquiry
router.post("/", async (req, res, next) => {
  try {
    const {
      customerName,
      email,
      message,
      crane,
      period,
      address,
      needsTransport,
      needsInstallation,
    } = req.body;

    // Validate required fields
    if (![customerName, email, message, crane].every(Boolean)) {
      return res
        .status(400)
        .json({ message: "Provide name, email, message and crane Id" });
    }

    // Validate crane Id format
    if (!mongoose.Types.ObjectId.isValid(crane)) {
      return res.status(400).json({ message: "Invalid crane ID." });
    }

    const newInquiry = await Inquiry.create({
      customerName,
      email,
      message,
      crane,
      period,
      address,
      needsTransport,
      needsInstallation,
    });

    res.status(201).json(newInquiry);
  } catch (error) {
    next(error);
  }
});

// Retrieve all inquiries
router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const role = req.payload.role;
    if (role !== "admin") {
      return res.status(403).json("Forbidden: admin only");
    }

    const allInquiries = await Inquiry.find({})
      .populate({
        path: "crane",
        select: "producer seriesCode variantRevision",
      })
      .exec();
    res.json(allInquiries);
  } catch (error) {
    next(error);
  }
});

// Retrieve a secific inquiry (by id)
router.get("/:inquiryId", isAuthenticated, async (req, res, next) => {
  try {
    const { inquiryId } = req.params;

    const role = req.payload.role;
    if (role !== "admin") {
      return res.status(403).json("Forbidden: admin only");
    }

    if (!mongoose.Types.ObjectId.isValid(inquiryId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const inquiry = await Inquiry.findById(inquiryId).populate("crane");
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    next(error);
  }
});

// Update a specific inquiry (by id)
router.put("/:inquiryId", isAuthenticated, async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const {
      customerName,
      email,
      message,
      crane,
      period,
      address,
      needsTransport,
      needsInstallation,
      status,
      isRead,
    } = req.body;

    const role = req.payload.role;
    if (role !== "admin") {
      return res.status(403).json("Forbidden: admin only");
    }

    if (!mongoose.Types.ObjectId.isValid(inquiryId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const updateData = {};
    for (let key of [
      "status",
      "period",
      "isRead",
      "customerName",
      "email",
      "message",
      "crane",
      "address",
      "needsTransport",
      "needsInstallation",
    ]) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      inquiryId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json(updatedInquiry);
  } catch (error) {}
});

// Delete a specific inquiry (by id)
router.delete("/:inquiryId", isAuthenticated, async (req, res, next) => {
  try {
    const { inquiryId } = req.params;

    const role = req.payload.role;
    if (role !== "admin") {
      return res.status(403).json("Forbidden: admin only");
    }

    if (!mongoose.Types.ObjectId.isValid(inquiryId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }

    const deletedInquiry = await Inquiry.findByIdAndDelete(inquiryId);
    if (!deletedInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    res.status(200).json({
      message: `Inquiry with ${inquiryId} was deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
