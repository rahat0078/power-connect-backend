import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import {
  ICreatePowerServicePayload,
  IUpdatePowerServicePayload,
  IUpdatePowerServiceStatusPayload,
} from "./powerService.interface";
import { AppError } from "../../utils/AppError";
import { AuditLogService } from "../auditLog/auditLog.service";

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
  updatePowerServiceStatus
};
