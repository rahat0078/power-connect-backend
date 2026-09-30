import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { PowerServiceService } from './powerService.service';
import { sendResponse } from '../../utils/sendResponse';

const createPowerService = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user!;

  const result = await PowerServiceService.createPowerService(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Power Service created successfully',
    data: result,
  });
});



const getMyPowerServices = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user!;

  const result = await PowerServiceService.getMyPowerServices(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My Power Services fetched successfully',
    data: result,
  });
});



const updatePowerService = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user!;

  const { id } = req.params;
  const result = await PowerServiceService.updatePowerService(userId, id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Power Service updated successfully',
    data: result,
  });
});

const updatePowerServiceStatus = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user!;
  const { id } = req.params;
  const result = await PowerServiceService.updatePowerServiceStatus(userId, id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Power Service status updated successfully',
    data: result,
  });
});


const deletePowerService = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user!;
  const { id } = req.params;
  const result = await PowerServiceService.deletePowerService(userId, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Power Service deleted successfully',
    data: result,
  });
});

export const PowerServiceController = {
  createPowerService,
  getMyPowerServices,
  updatePowerService,
  deletePowerService,
  updatePowerServiceStatus
};