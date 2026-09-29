import httpStatus from "http-status";
import {
  ICreateOutageReportPayload,
  IOutageReportQuery,
  IUpdateOutageReportStatusPayload,
} from "./outageReport.interface";
import { prisma } from "../../lib/prisma";
import { OutageStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../utils/AppError";
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../constants/audit.constant";
import { AuditLogService } from "../auditLog/auditLog.service";

const createOutageReport = async (
  payload: ICreateOutageReportPayload,
  userId: string,
) => {
  const result = await prisma.outageReport.create({
    data: {
      area: payload.area,
      description: payload.description,
      userId,
      status: OutageStatus.PENDING,
    },
  });

  return result;
};

const getMyOutageReports = async (
  userId: string,
  query: IOutageReportQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.OutageReportWhereInput[] = [];


  andConditions.push({
    userId,
  });


  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          area: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  
  if (query.area) {
    andConditions.push({
      area: {
        contains: query.area,
        mode: "insensitive",
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status as OutageStatus,
    });
  }

  const whereConditions: Prisma.OutageReportWhereInput = {
    AND: andConditions.length > 0 ? andConditions : undefined,
  };

  const reports = await prisma.outageReport.findMany({
    where: whereConditions,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalReportCount = await prisma.outageReport.count({
    where: whereConditions,
  });

  return {
    data: reports,
    meta: {
      page,
      limit,
      total: totalReportCount,
      totalPages: Math.ceil(totalReportCount / limit),
    },
  };
};

const getAllOutageReports = async (query: IOutageReportQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.OutageReportWhereInput[] = [];


  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          area: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }


  if (query.area) {
    andConditions.push({
      area: {
        contains: query.area,
        mode: "insensitive",
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status as OutageStatus,
    });
  }

  const whereConditions: Prisma.OutageReportWhereInput = {
    AND: andConditions.length > 0 ? andConditions : undefined,
  };

  const reports = await prisma.outageReport.findMany({
    where: whereConditions,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const totalReportCount = await prisma.outageReport.count({
    where: whereConditions,
  });

  return {
    data: reports,
    meta: {
      page,
      limit,
      total: totalReportCount,
      totalPages: Math.ceil(totalReportCount / limit),
    },
  };
};

const updateOutageReportStatus = async (
  id: string,
  payload: IUpdateOutageReportStatusPayload,
  userId: string
) => {
  const isExist = await prisma.outageReport.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Outage report not found");
  }

  if (
    isExist.status === OutageStatus.RESOLVED &&
    payload.status === OutageStatus.RESOLVED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Outage report is already marked as RESOLVED"
    );
  }

  const resolvedAt = payload.status === OutageStatus.RESOLVED ? new Date() : null;

  const result = await prisma.outageReport.update({
    where: { id },
    data: {
      status: payload.status,
      resolvedAt,
    },
  });

  // Audit Log Integration
  await AuditLogService.createAuditLog({
    userId,
    action: AUDIT_ACTION.UPDATE_STATUS,
    entity: AUDIT_ENTITY.OUTAGE_REPORT,
    entityId: result.id,
    metadata: {
      previousStatus: isExist.status,
      newStatus: result.status,
      area: result.area,
      resolvedAt: result.resolvedAt,
    },
  });

  return result;
};

export const OutageReportService = {
  createOutageReport,
  getMyOutageReports,
  getAllOutageReports,
  updateOutageReportStatus,
};
