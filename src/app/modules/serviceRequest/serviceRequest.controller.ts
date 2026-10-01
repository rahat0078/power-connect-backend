import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ServiceRequestService } from './serviceRequest.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createServiceRequest = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user!;
  const result = await ServiceRequestService.createServiceRequest(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Service request created successfully',
    data: result,
  });
});

const getMyServiceRequests = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user!;
  const result = await ServiceRequestService.getMyServiceRequests(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My service requests fetched successfully',
    data: result,
  });
});


export const ServiceRequestController = {
  createServiceRequest,
  getMyServiceRequests
};