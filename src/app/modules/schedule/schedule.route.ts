import express from "express";
import { ScheduleController } from "./schedule.controller";
import { ScheduleValidation } from "./schedule.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(ScheduleValidation.createScheduleZodSchema),
  ScheduleController.createSchedule
);

router.get(
  "/",
  auth(Role.ADMIN, Role.PROVIDER, Role.RESIDENT),
  ScheduleController.getAllSchedules
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.PROVIDER, Role.RESIDENT),
  ScheduleController.getSingleSchedule
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(ScheduleValidation.updateScheduleZodSchema),
  ScheduleController.updateSchedule
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  ScheduleController.deleteSchedule
);

export const ScheduleRoutes = router;