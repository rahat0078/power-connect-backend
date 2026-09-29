import express from "express";
import { OutageReportController } from "./outageReport.controller";
import { OutageReportValidation } from "./outageReport.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/",
  auth(Role.RESIDENT),
  validateRequest(OutageReportValidation.createOutageReportZodSchema),
  OutageReportController.createOutageReport
);


router.get(
  "/my-reports",
  auth(Role.RESIDENT),
  OutageReportController.getMyOutageReports
);

router.get(
  "/",
  auth(Role.ADMIN),
  OutageReportController.getAllOutageReports
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(OutageReportValidation.updateOutageReportStatusZodSchema),
  OutageReportController.updateOutageReportStatus
);

export const OutageReportRoutes = router;