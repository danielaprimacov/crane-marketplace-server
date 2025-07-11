const express = require("express");
const router = express.Router();

const Message = require("../models/Message.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isAdmin } = require("../middleware/role.middleware");

router.get("/", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const all = await Message.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    // you might want to validate required fields here based on formType
    const msg = await Message.create(data);
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
