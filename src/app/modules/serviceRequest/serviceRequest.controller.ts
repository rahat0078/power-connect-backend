import { Request, Response } from "express";
import httpStatus from "http-status";
import { ServiceRequestService } from "./serviceRequest.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createServiceRequest = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await ServiceRequestService.createServiceRequest(
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service request created successfully",
    data: result,
  });
});

const getMyServiceRequests = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const result = await ServiceRequestService.getMyServiceRequests(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My service requests fetched successfully",
    data: result,
  });
});

const getProviderServiceRequests = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const result = await ServiceRequestService.getProviderServiceRequests(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider service requests fetched successfully",
      data: result,
    });
  },
);

const updateServiceRequestStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { id } = req.params;
    const result = await ServiceRequestService.updateServiceRequestStatus(
      userId,
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service request status updated successfully",
      data: result,
    });
  },
);


const completeServiceRequest = catchAsync(async (req: Request, res: Response) => {
 const { userId } = req.user!;
  const { id } = req.params;
  const result = await ServiceRequestService.completeServiceRequest(userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service request completed successfully',
    data: result,
  });
});

const cancelServiceRequest = catchAsync(async (req: Request, res: Response) => {
 const { userId } = req.user!;
  const { id } = req.params;
  const result = await ServiceRequestService.cancelServiceRequest(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service request cancelled successfully',
    data: result,
  });
});



export const ServiceRequestController = {
  createServiceRequest,
  getMyServiceRequests,
  getProviderServiceRequests,
  updateServiceRequestStatus,
};
