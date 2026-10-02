import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AdminService } from './admin.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {

  const result = await AdminService.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await AdminService.updateUserRoleInDB(id as string, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const {data, meta} = await AdminService.getAuditLogsFromDB(
    Number(page) || 1,
    Number(limit) || 10
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs retrieved successfully',
    data: data,
    meta: meta
  });
});

export const AdminController = {
  getAllUsers,
  updateUserRole,
  getDashboardStats,
  getAuditLogs,
};