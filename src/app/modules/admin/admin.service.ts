import httpStatus from "http-status";
import { IUserFilterRequest } from "./admin.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Role } from "../../../generated/prisma/enums";

// 1. Get All Users (Pagination + Search/Filtering)
const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });


  return users
};

const updateUserRoleInDB = async (userId: string, newRole: Role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const getDashboardStatsFromDB = async () => {
  const totalUsers = await prisma.user.count();
  const totalServices = await prisma.powerService.count();
  const totalRequests = await prisma.serviceRequest.count();

  const totalRevenueResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" },
  });

  return {
    totalUsers,
    totalServices,
    totalRequests,
    totalRevenue: totalRevenueResult._sum.amount || 0,
  };
};

// 4. Get Audit Logs
const getAuditLogsFromDB = async (page = 1, limit = 10) => {
  const skip = (Number(page) - 1) * Number(limit);

  const logs = await prisma.auditLog.findMany({
    skip,
    take: Number(limit),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  const total = await prisma.auditLog.count();

  return {
    data: logs,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
  };
};

export const AdminService = {
  getAllUsersFromDB,
  updateUserRoleInDB,
  getDashboardStatsFromDB,
  getAuditLogsFromDB,
};
