const { z } = require("zod");

const NEWSLETTER_TOPICS = [
  "newListings",
  "industryInsights",
  "safetyCompliance",
  "maintenanceService",
  "financingLeasing",
];

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid message id");

function emptyToUndefined(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

const optionalHoneypot = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional()
);

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

const requiredText = (fieldName, min = 1, max = 1000) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .trim()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must be at most ${max} characters`);

const emailSchema = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .trim()
  .toLowerCase()
  .email("Email must be valid");

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

const contactMessageSchema = z
  .object({
    formType: z.literal("contact"),

    website: optionalHoneypot,

    salutation: requiredText("Salutation", 1, 50),
    firstName: requiredText("First name", 1, 100),
    lastName: requiredText("Last name", 1, 100),
    email: emailSchema,
    country: requiredText("Country", 1, 100),
    phone: optionalText("Phone", 50),
    message: requiredText("Message", 1, 3000),
  })
  .strict();

const expertMessageSchema = z
  .object({
    formType: z.literal("expert"),

    website: optionalHoneypot,

    name: requiredText("Name", 1, 150),
    company: optionalText("Company", 150),
    email: emailSchema,
    phone: optionalText("Phone", 50),
    projectDetails: requiredText("Project details", 1, 5000),
  })
  .strict();

const newsletterMessageSchema = z
  .object({
    formType: z.literal("newsletter"),

    website: optionalHoneypot,

    firstName: requiredText("First name", 1, 100),
    lastName: requiredText("Last name", 1, 100),
    email: emailSchema,
    phone: optionalText("Phone", 50),

    topics: z
      .array(z.enum(NEWSLETTER_TOPICS))
      .min(1, "Please select at least one newsletter topic"),

    agreeComm: optionalBoolean("Communication consent"),
    agreeNewsletter: optionalBoolean("Newsletter consent"),

    recaptchaToken: optionalText("reCAPTCHA token", 5000),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.agreeComm !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["agreeComm"],
        message: "Communication consent is required",
      });
    }

    if (data.agreeNewsletter !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["agreeNewsletter"],
        message: "Newsletter consent is required",
      });
    }
  });

const createMessageSchema = z.object({
  body: z.discriminatedUnion("formType", [
    contactMessageSchema,
    expertMessageSchema,
    newsletterMessageSchema,
  ]),
});

const messageIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

module.exports = {
  createMessageSchema,
  messageIdParamSchema,
};
