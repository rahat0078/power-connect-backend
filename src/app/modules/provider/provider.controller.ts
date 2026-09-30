import { Request, Response } from "express";
import httpStatus from "http-status";
import { ProviderService } from "./provider.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const applyAsProvider = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await ProviderService.applyAsProvider(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Provider application submitted successfully",
    data: result,
  });
});

const getPendingProviders = catchAsync(async (req: Request, res: Response) => {
  const result = await ProviderService.getPendingProviders();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending provider applications fetched successfully",
    data: result,
  });
});

const approveProvider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user!;
  const result = await ProviderService.approveProvider(id as string, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider application approved successfully",
    data: result,
  });
});

const rejectProvider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user!;
  const result = await ProviderService.rejectProvider(id as string, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider application rejected successfully",
    data: result,
  });
});

const getMyProviderProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await ProviderService.getMyProviderProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Provider profile retrieved successfully",
    data: result,
  });
});

const updateMyProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const result = await ProviderService.updateMyProviderProfile(
      userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider profile updated successfully",
      data: result,
    });
  },
);

export const ProviderController = {
  applyAsProvider,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
};
