const { z } = require("zod");

function emptyToUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.preprocess(
        emptyToUndefined,
        z
          .string({
            invalid_type_error: "Name must be a string",
          })
          .trim()
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name must be at most 100 characters")
          .optional()
      ),

      email: z.preprocess(
        emptyToUndefined,
        z
          .string({
            invalid_type_error: "Email must be a string",
          })
          .trim()
          .toLowerCase()
          .email("Email must be valid")
          .optional()
      ),

      currentPassword: z.preprocess(
        emptyToUndefined,
        z
          .string({
            invalid_type_error: "Current password must be a string",
          })
          .min(1, "Current password is required")
          .optional()
      ),

      newPassword: z.preprocess(
        emptyToUndefined,
        z
          .string({
            invalid_type_error: "New password must be a string",
          })
          .min(8, "New password must be at least 8 characters")
          .max(128, "New password must be at most 128 characters")
          .optional()
      ),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (Object.keys(data).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [],
          message: "At least one field is required for update",
        });
      }

      if (data.currentPassword && !data.newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["newPassword"],
          message: "New password is required when current password is provided",
        });
      }

      if (data.newPassword && !data.currentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPassword"],
          message: "Current password is required when changing password",
        });
      }
    }),
});

module.exports = {
  updateProfileSchema,
};
