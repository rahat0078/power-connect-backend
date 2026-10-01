import { z } from "zod";

const createServiceRequestZodSchema = z.object({
  serviceId: z.string("Service ID is required"),
  address: z.string("Address is required"),
  scheduledAt: z.string("Scheduled date and time is required"),
});

export const ServiceRequestValidation = {
  createServiceRequestZodSchema,
};
