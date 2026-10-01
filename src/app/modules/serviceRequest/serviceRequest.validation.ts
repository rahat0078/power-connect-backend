import { z } from "zod";
import { RequestStatus } from "../../../generated/prisma/enums";

const createServiceRequestZodSchema = z.object({
  serviceId: z.string("Service ID is required"),
  address: z.string("Address is required"),
  scheduledAt: z.string("Scheduled date and time is required"),
});

const updateServiceRequestStatusZodSchema = z.object({
  status: z.nativeEnum(RequestStatus, { error: "Status is required" }),
});

export const ServiceRequestValidation = {
  createServiceRequestZodSchema,
  updateServiceRequestStatusZodSchema
};
