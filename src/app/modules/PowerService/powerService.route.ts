import express from "express";
import { PowerServiceController } from "./powerService.controller";
import { PowerServiceValidation } from "./powerService.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

// Public get all ; get single

// Provider Routes
router.get(
  "/my-services",
  auth(Role.PROVIDER),
  PowerServiceController.getMyPowerServices,
);

router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(PowerServiceValidation.createPowerServiceZodSchema),
  PowerServiceController.createPowerService,
);

router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(PowerServiceValidation.updatePowerServiceZodSchema),
  PowerServiceController.updatePowerService,
);

router.patch(
  '/status/:id',
  auth(Role.PROVIDER),
  validateRequest(PowerServiceValidation.updatePowerServiceStatusZodSchema),
  PowerServiceController.updatePowerServiceStatus
);

router.delete(
  "/:id",
  auth(Role.PROVIDER),
  PowerServiceController.deletePowerService,
);

export const PowerServiceRoutes = router;
