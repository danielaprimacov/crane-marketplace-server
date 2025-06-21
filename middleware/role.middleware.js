function isAdmin(req, res, next) {
  if (req.payload?.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admins only." });
  }
  next();
}

module.exports = { isAdmin };
