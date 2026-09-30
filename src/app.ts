import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { ScheduleRoutes } from "./app/modules/schedule/schedule.route";
import { OutageReportRoutes } from "./app/modules/outageReport/outageReport.route";
import { ProviderRoutes } from "./app/modules/provider/provider.route";
import { PowerServiceRoutes } from "./app/modules/PowerService/powerService.route";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/schedule", ScheduleRoutes);
app.use("/api/v1/outage-reports", OutageReportRoutes);
app.use("/api/v1/providers", ProviderRoutes);
app.use("/api/v1/services", PowerServiceRoutes);

// Basic route
app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to PH Healthcare System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
