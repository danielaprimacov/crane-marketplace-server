const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

function emptyToUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

const requiredText = (fieldName, min = 1, max = 1000) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .trim()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must be at most ${max} characters`);

const optionalText = (fieldName, max = 1000) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string({
        invalid_type_error: `${fieldName} must be a string`,
      })
      .trim()
      .max(max, `${fieldName} must be at most ${max} characters`)
      .optional()
  );

const optionalBoolean = (fieldName) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (value === "true") return true;
      if (value === "false") return false;

      return value;
    },
    z
      .boolean({
        invalid_type_error: `${fieldName} must be a boolean`,
      })
      .optional()
  );

const optionalDateString = (fieldName) =>
  z.preprocess(
    emptyToUndefined,
    z
      .string({
        invalid_type_error: `${fieldName} must be a valid date string`,
      })
      .trim()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        `${fieldName} must be a valid date`
      )
      .optional()
  );

const periodSchema = z.preprocess(
  emptyToUndefined,
  z
    .object({
      from: optionalDateString("Period from"),
      to: optionalDateString("Period to"),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.from && data.to && Date.parse(data.to) < Date.parse(data.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to"],
          message: "Period end date cannot be before start date",
        });
      }
    })
    .optional()
);

const createInquiryBodySchema = z
  .object({
    customerName: requiredText("Customer name", 2, 100),

    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .trim()
      .toLowerCase()
      .email("Email must be valid"),

    message: requiredText("Message", 5, 3000),

    crane: objectIdSchema,

    period: periodSchema,

    address: optionalText("Address", 500),

    needsTransport: optionalBoolean("Needs transport"),

    needsInstallation: optionalBoolean("Needs installation"),
  })
  .strict();

const updateInquiryBodySchema = z
  .object({
    customerName: optionalText("Customer name", 100),

    email: z.preprocess(
      emptyToUndefined,
      z.string().trim().toLowerCase().email("Email must be valid").optional()
    ),

    message: optionalText("Message", 3000),

    crane: objectIdSchema.optional(),

    period: periodSchema,

    address: optionalText("Address", 500),

    needsTransport: optionalBoolean("Needs transport"),

    needsInstallation: optionalBoolean("Needs installation"),

    status: z.enum(["new", "in_progress", "resolved"]).optional(),

    isRead: optionalBoolean("Is read"),
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
  });

const inquiryIdParamSchema = z.object({
  params: z.object({
    inquiryId: objectIdSchema,
  }),
});

const createInquirySchema = z.object({
  body: createInquiryBodySchema,
});

const updateInquirySchema = z.object({
  params: z.object({
    inquiryId: objectIdSchema,
  }),
  body: updateInquiryBodySchema,
});

module.exports = {
  createInquirySchema,
  updateInquirySchema,
  inquiryIdParamSchema,
};
