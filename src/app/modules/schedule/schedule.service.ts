import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateSchedulePayload, IScheduleQuery, IUpdateSchedulePayload } from "./schedule.interface";
import { Prisma, ScheduleStatus } from "../../../generated/prisma/client";

const createSchedule = async (
  payload: ICreateSchedulePayload,
  userId: string,
) => {
  const isExistingSchedule = await prisma.powerSchedule.findFirst({
    where: {
      area: payload.area,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      deletedAt: null,
    },
  });

  if (isExistingSchedule) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A schedule already exists for this area at the specified time range",
    );
  }

  const result = await prisma.powerSchedule.create({
    data: {
      area: payload.area,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      description: payload.description ?? null,
      createdById: userId,
    },
  });

  return result;
};

const getAllSchedules = async (query: IScheduleQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.PowerScheduleWhereInput[] = [];

  
  andConditions.push({
    deletedAt: null,
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

  // Filters
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
      status: query.status as ScheduleStatus,
    });
  }

  // Date range filters
  if (query.startDate) {
    andConditions.push({
      startTime: {
        gte: new Date(query.startDate),
      },
    });
  }

  if (query.endDate) {
    andConditions.push({
      endTime: {
        lte: new Date(query.endDate),
      },
    });
  }

  const whereConditions: Prisma.PowerScheduleWhereInput = {
    AND: andConditions.length > 0 ? andConditions : undefined,
  };

  const schedules = await prisma.powerSchedule.findMany({
    where: whereConditions,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const totalScheduleCount = await prisma.powerSchedule.count({
    where: whereConditions,
  });

  return {
    data: schedules,
    meta: {
      page,
      limit,
      total: totalScheduleCount,
      totalPages: Math.ceil(totalScheduleCount / limit),
    },
  };
};

const getSingleSchedule = async (id: string) => {
  const result = await prisma.powerSchedule.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  return result;
};

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
  const isExist = await prisma.powerSchedule.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  const updateData: Prisma.PowerScheduleUpdateInput = {};

  if (payload.area) updateData.area = payload.area;
  if (payload.description !== undefined)
    updateData.description = payload.description;
  if (payload.status) updateData.status = payload.status;
  if (payload.startTime) updateData.startTime = new Date(payload.startTime);
  if (payload.endTime) updateData.endTime = new Date(payload.endTime);

  const effectiveStartTime = updateData.startTime
    ? (updateData.startTime as Date)
    : isExist.startTime;
  const effectiveEndTime = updateData.endTime
    ? (updateData.endTime as Date)
    : isExist.endTime;

  if (effectiveEndTime <= effectiveStartTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End time must be after start time",
    );
  }

  const result = await prisma.powerSchedule.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteSchedule = async (id: string) => {
  const isExist = await prisma.powerSchedule.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!isExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
  }

  const result = await prisma.powerSchedule.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return result;
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  updateSchedule,
  deleteSchedule,
};
