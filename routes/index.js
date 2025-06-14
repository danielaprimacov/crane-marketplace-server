const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("home page");
});

module.exports = router;
