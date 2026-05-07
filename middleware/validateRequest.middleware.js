function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = {};

      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      }

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    req.body = result.data.body || req.body;
    req.params = result.data.params || req.params;
    req.query = result.data.query || req.query;

    next();
  };
}

module.exports = validateRequest;
