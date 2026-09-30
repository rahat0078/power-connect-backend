import express from "express";
import { ProviderController } from "./provider.controller";
import { ProviderValidation } from "./provider.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();


router.post(
  "/apply",
  auth(Role.RESIDENT),
  validateRequest(ProviderValidation.createProviderProfileZodSchema),
  ProviderController.applyAsProvider
);

router.get(
  "/pending",
  auth(Role.ADMIN),
  ProviderController.getPendingProviders
);

router.patch(
  "/approve/:id",
  auth(Role.ADMIN),
  ProviderController.approveProvider
);

router.patch(
  "/reject/:id",
  auth(Role.ADMIN),
  ProviderController.rejectProvider
);

router.get(
  "/me",
  auth(Role.PROVIDER),
  ProviderController.getMyProviderProfile
);

router.patch(
  "/me",
  auth(Role.PROVIDER),
  validateRequest(ProviderValidation.updateProviderProfileZodSchema),
  ProviderController.updateMyProviderProfile
);

export const ProviderRoutes = router;