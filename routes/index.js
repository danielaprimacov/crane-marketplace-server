const router = require("express").Router();

const authRouter = require("./auth.routes");
const adminRouter = require("./admin.routes");
const usersRouter = require("./users.routes");
const messagesRouter = require("./message.routes");
const craneRouter = require("./crane.routes");
const inquiryRouter = require("./inquiry.routes");

router.get("/", (req, res) => {
  res.status(200).json({ message: "KranHub API is running" });
});

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/users", usersRouter);
router.use("/messages", messagesRouter);
router.use("/cranes", craneRouter);
router.use("/inquiries", inquiryRouter);

module.exports = router;
