import { z } from "zod";
import { ServiceStatus } from "../../../generated/prisma/enums";

const createPowerServiceZodSchema = z.object({
  body: z.object({
    name: z.string("Service name is required"),
    description: z.string("Description is required"),
    price: z
      .number("Price is required")
      .positive("Price must be a positive number"),
    capacity: z.string("Capacity is required"),
  }),
});

const updatePowerServiceZodSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  capacity: z.string().optional(),
});

const updatePowerServiceStatusZodSchema = z.object({
  status: z.nativeEnum(ServiceStatus, "Status is required"),
});

export const PowerServiceValidation = {
  createPowerServiceZodSchema,
  updatePowerServiceZodSchema,
  updatePowerServiceStatusZodSchema,
};
