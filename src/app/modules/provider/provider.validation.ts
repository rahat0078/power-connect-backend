import { z } from "zod";

const createProviderProfileZodSchema = z.object({
  businessName: z
    .string("Business name is required")
    .min(2, "Business name must be at least 2 characters long"),
  phone: z
    .string("Phone number is required")
    .regex(/^(?:\+88|88)?01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  address: z
    .string("Address is required")
    .min(5, "Address must be at least 5 characters long"),
});

const updateProviderProfileZodSchema = z.object({
  businessName: z
    .string("Business name is required")
    .min(2, "Business name must be at least 2 characters long").optional(),
  phone: z
    .string("Phone number is required")
    .regex(/^(?:\+88|88)?01[3-9]\d{8}$/, "Invalid Bangladeshi phone number").optional(),
  address: z
    .string("Address is required")
    .min(5, "Address must be at least 5 characters long").optional(),
});

export const ProviderValidation = {
  createProviderProfileZodSchema,
  updateProviderProfileZodSchema,
};
