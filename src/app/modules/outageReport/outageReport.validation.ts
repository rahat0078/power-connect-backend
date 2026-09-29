import { z } from "zod";
import { OutageStatus } from "../../../generated/prisma/enums";

const createOutageReportZodSchema = z.object({
  area: z
    .string("Area is required")
    .min(2, "Area must be at least 2 characters"),
  description: z
    .string("Description is required")
    .min(5, "Description must be at least 5 characters"),
});

const updateOutageReportStatusZodSchema = z.object({
  status: z.nativeEnum(OutageStatus, { error: "Status is required" }),
});

export const OutageReportValidation = {
  createOutageReportZodSchema,
  updateOutageReportStatusZodSchema,
};
