import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { OutageReportService } from "./outageReport.service";
import { sendResponse } from "../../utils/sendResponse";

const createOutageReport = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { userId } = req.user!;

  const result = await OutageReportService.createOutageReport(payload, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Outage report submitted successfully",
    data: result,
  });
});

const getMyOutageReports = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const query = req.query;

  const result = await OutageReportService.getMyOutageReports(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My outage reports retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllOutageReports = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await OutageReportService.getAllOutageReports(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All outage reports retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateOutageReportStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const { userId } = req.user!;

    const result = await OutageReportService.updateOutageReportStatus(id as string, payload, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Outage report status updated successfully",
      data: result,
    });
});

export const OutageReportController = {
  createOutageReport,
  getMyOutageReports,
  getAllOutageReports,
  updateOutageReportStatus,
};
