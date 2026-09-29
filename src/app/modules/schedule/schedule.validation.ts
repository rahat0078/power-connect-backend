import { z } from "zod";
import { ScheduleStatus } from "../../../generated/prisma/enums";

const createScheduleZodSchema = z
  .object({
    area: z
      .string("Area is required")
      .min(2, "Area must be at least 2 characters"),

    startTime: z
      .string("Start time is required")
      .datetime("Start time must be a valid ISO datetime string"),

    endTime: z
      .string("End time is required")
      .datetime("End time must be a valid ISO datetime string"),

    description: z.string().optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const updateScheduleZodSchema = z
  .object({
    area: z.string().min(2, "Area must be at least 2 characters").optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ScheduleStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["body", "endTime"],
    },
  );



export const ScheduleValidation = {
  createScheduleZodSchema,
  updateScheduleZodSchema,
};
