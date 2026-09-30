import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import {
  ICreatePowerServicePayload,
  IPowerServiceFilterRequest,
  IUpdatePowerServicePayload,
  IUpdatePowerServiceStatusPayload,
} from "./powerService.interface";
import { AppError } from "../../utils/AppError";
import { ServiceStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";

const createPowerService = async (
  userId: string,
  payload: ICreatePowerServicePayload,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const result = await prisma.powerService.create({
    data: {
      ...payload,
      providerId: provider.id,
    },
  });

  return result;
};

const getAllPowerServices = async (filters: IPowerServiceFilterRequest) => {
  const { searchTerm, minPrice, maxPrice } = filters;
  const limit = filters.limit ? Number(filters.limit) : 10;
  const page = filters.page ? Number(filters.page) : 1;
  const skip = (page - 1) * limit;
  const andConditions: Prisma.PowerServiceWhereInput[] = [
    { deletedAt: null },
    { status: ServiceStatus.ACTIVE },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { capacity: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    });
  }

  const whereConditions: Prisma.PowerServiceWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const totalServices =  await prisma.powerService.findMany({
    where: whereConditions,
    include: {
      provider: {
        select: {
          id: true,
          address: true,
          businessName: true,
          phone: true,
        },
      },
    },
    take: limit,
    skip,
    orderBy: { createdAt: "desc" },
  });

  const totalServicesCount = await prisma.powerService.count({
    where: whereConditions,
  });

  return {
    data: totalServices,
    meta: {
      page,
      limit,
      total: totalServicesCount,
      totalPages: Math.ceil(totalServicesCount / limit),
    },
  };


};

const getSinglePowerService = async (id: string) => {
  const result = await prisma.powerService.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      provider: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Power service not found");
  }

  return result;
};

const getMyPowerServices = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  return await prisma.powerService.findMany({
    where: {
      providerId: provider.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updatePowerService = async (
  userId: string,
  id: string,
  payload: IUpdatePowerServicePayload,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const isExist = await prisma.powerService.findFirst({
    where: { id, providerId: provider.id, deletedAt: null },
  });

  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Power service not found or unauthorized",
    );
  }

  const result = await prisma.powerService.update({
    where: { id },
    data: payload,
  });

  return result;
};

const updatePowerServiceStatus = async (
  userId: string,
  id: string,
  payload: IUpdatePowerServiceStatusPayload,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const isExist = await prisma.powerService.findFirst({
    where: { id, providerId: provider.id, deletedAt: null },
  });

  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Power service not found or unauthorized",
    );
  }

  const result = await prisma.powerService.update({
    where: { id },
    data: { status: payload.status },
  });

  return result;
};

const deletePowerService = async (userId: string, id: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const isExist = await prisma.powerService.findFirst({
    where: { id, providerId: provider.id, deletedAt: null },
  });

  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Power service not found or unauthorized",
    );
  }

  const result = await prisma.powerService.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return result;
};

export const PowerServiceService = {
  createPowerService,
  getMyPowerServices,
  updatePowerService,
  deletePowerService,
  updatePowerServiceStatus,
  getAllPowerServices,
  getSinglePowerService,
};
