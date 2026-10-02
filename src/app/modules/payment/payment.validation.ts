import { z } from "zod";

const createPaymentCheckoutZodSchema = z.object({
  serviceRequestId: z.string("Service Request ID is required"),
});

const confirmPaymentZodSchema = z.object({
  sessionId: z.string("Stripe Session ID is required"),
});

export const PaymentValidation = {
  createPaymentCheckoutZodSchema,
  confirmPaymentZodSchema,
};
