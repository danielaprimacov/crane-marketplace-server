function validateRequest(schema) {
  return (req, res, next) => {
    try {
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
          code: "VALIDATION_ERROR",
          details: errors,
        });
      }

      if (result.data.body !== undefined) {
        req.body = result.data.body;
      }

      if (result.data.params !== undefined) {
        req.params = result.data.params;
      }

      if (result.data.query !== undefined) {
        Object.assign(req.query, result.data.query);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = validateRequest;
