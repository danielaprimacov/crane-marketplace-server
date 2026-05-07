const { z } = require("zod");

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid crane id");

function normalizeEmpty(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

const requiredText = (fieldName, max = 255) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .max(max, `${fieldName} must be at most ${max} characters`);

const optionalText = (fieldName, max = 255) =>
  z.preprocess(
    normalizeEmpty,
    z
      .string()
      .trim()
      .max(max, `${fieldName} must be at most ${max} characters`)
      .optional()
  );

const requiredNonNegativeNumber = (fieldName) =>
  z
    .any()
    .refine(
      (value) => value !== "" && value !== null && value !== undefined,
      `${fieldName} is required`
    )
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value), `${fieldName} must be a number`)
    .refine((value) => value >= 0, `${fieldName} must be 0 or greater`);

const optionalNonNegativeNumber = (fieldName) =>
  z
    .any()
    .optional()
    .transform((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    })
    .refine(
      (value) => value === undefined || Number.isFinite(value),
      `${fieldName} must be a number`
    )
    .refine(
      (value) => value === undefined || value >= 0,
      `${fieldName} must be 0 or greater`
    );

const imagesSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Image URL cannot be empty")
      .url("Image must be a valid URL")
  )
  .min(1, "At least one image is required")
  .max(10, "Maximum 10 images are allowed");

const rentPriceSchema = z.preprocess(
  normalizeEmpty,
  z
    .object({
      amount: requiredNonNegativeNumber("Rent price amount"),
      interval: z.enum(["hour", "day", "week", "month"], {
        message: "Rent price interval must be hour, day, week, or month",
      }),
    })
    .strict()
    .optional()
);

const optionalDateString = (fieldName) =>
  z.preprocess(
    normalizeEmpty,
    z
      .string()
      .trim()
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        `${fieldName} must be a valid date`
      )
      .optional()
  );

const availabilitySchema = z.preprocess(
  normalizeEmpty,
  z
    .object({
      from: optionalDateString("Availability from"),
      to: optionalDateString("Availability to"),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.from && data.to && Date.parse(data.to) < Date.parse(data.from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["to"],
          message: "Availability end date cannot be before start date",
        });
      }
    })
    .optional()
);

const baseCraneBodySchema = z
  .object({
    producer: requiredText("Producer", 100),

    seriesCode: requiredText("Series code", 100),

    capacityClassNumber: requiredNonNegativeNumber("Capacity class number"),

    capacity: optionalNonNegativeNumber("Capacity"),

    variantRevision: optionalText("Variant revision", 100),

    radius: requiredNonNegativeNumber("Radius"),

    height: requiredNonNegativeNumber("Height"),

    images: imagesSchema,

    description: optionalText("Description", 5000),

    salePrice: optionalNonNegativeNumber("Sale price"),

    rentPrice: rentPriceSchema,

    location: requiredText("Location", 255),

    status: z.enum(["for sale", "for rent"], {
      message: "Status must be either 'for sale' or 'for rent'",
    }),

    availability: availabilitySchema,
  })
  .strict();

const createCraneBodySchema = baseCraneBodySchema.superRefine((data, ctx) => {
  if (data.status === "for sale" && data.salePrice === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["salePrice"],
      message: "Sale price is required when status is 'for sale'",
    });
  }

  if (data.status === "for rent" && data.rentPrice === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rentPrice"],
      message: "Rent price is required when status is 'for rent'",
    });
  }

  if (data.status === "for sale" && data.rentPrice !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["rentPrice"],
      message: "Rent price must not be provided when status is 'for sale'",
    });
  }

  if (data.status === "for rent" && data.salePrice !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["salePrice"],
      message: "Sale price must not be provided when status is 'for rent'",
    });
  }
});

const updateCraneBodySchema = baseCraneBodySchema
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [],
        message: "At least one field is required for update",
      });
    }

    if (data.status === "for sale" && data.salePrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price is required when status is changed to 'for sale'",
      });
    }

    if (data.status === "for rent" && data.rentPrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rentPrice"],
        message: "Rent price is required when status is changed to 'for rent'",
      });
    }

    if (data.status === "for sale" && data.rentPrice !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rentPrice"],
        message: "Rent price must not be provided when status is 'for sale'",
      });
    }

    if (data.status === "for rent" && data.salePrice !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price must not be provided when status is 'for rent'",
      });
    }
  });

const createCraneSchema = z.object({
  body: createCraneBodySchema,
});

const updateCraneSchema = z.object({
  params: z.object({
    craneId: objectIdSchema,
  }),
  body: updateCraneBodySchema,
});

const craneIdParamSchema = z.object({
  params: z.object({
    craneId: objectIdSchema,
  }),
});

module.exports = {
  createCraneSchema,
  updateCraneSchema,
  craneIdParamSchema,
};