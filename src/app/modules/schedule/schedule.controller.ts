import { Request, Response } from "express";
import httpStatus from "http-status";
import { ScheduleService } from "./schedule.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { userId } = req.user!;

  const result = await ScheduleService.createSchedule(payload, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Power schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ScheduleService.getAllSchedules(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Power schedules fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ScheduleService.getSingleSchedule(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Power schedule fetched successfully",
    data: result,
  });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await ScheduleService.updateSchedule(id as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Power schedule updated successfully",
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ScheduleService.deleteSchedule(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Power schedule soft-deleted successfully",
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  updateSchedule,
  deleteSchedule,
};
