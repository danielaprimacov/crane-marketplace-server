const { z } = require("zod");

const signupSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),

      email: z.string().trim().toLowerCase().email("Email must be valid"),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),
    })
    .strict(),
});

const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().toLowerCase().email("Email must be valid"),

      password: z.string().min(1, "Password is required"),
    })
    .strict(),
});

module.exports = {
  signupSchema,
  loginSchema,
};
