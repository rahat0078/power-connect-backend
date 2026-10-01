import httpStatus from "http-status";
import {
  ICreateServiceRequestPayload,
  IUpdateServiceRequestStatusPayload,
} from "./serviceRequest.interface";
import { prisma } from "../../lib/prisma";
import { RequestStatus, ServiceStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";

const createServiceRequest = async (
  userId: string,
  payload: ICreateServiceRequestPayload,
) => {
  const powerService = await prisma.powerService.findFirst({
    where: {
      id: payload.serviceId,
      status: ServiceStatus.ACTIVE,
      deletedAt: null,
    },
  });

  if (!powerService) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Power service not found or currently inactive",
    );
  }

  const totalAmount = powerService.price;

  const result = await prisma.serviceRequest.create({
    data: {
      userId,
      serviceId: powerService.id,
      providerId: powerService.providerId,
      address: payload.address,
      scheduledAt: new Date(payload.scheduledAt),
      totalAmount,
      status: RequestStatus.PENDING,
    },
    include: {
      service: true,
      provider: true,
    },
  });

  return result;
};

const getMyServiceRequests = async (userId: string) => {
  return await prisma.serviceRequest.findMany({
    where: {
      userId: userId,
    },
    include: {
      service: true,
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
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getProviderServiceRequests = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  return await prisma.serviceRequest.findMany({
    where: {
      providerId: provider.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateServiceRequestStatus = async (
  userId: string,
  id: string,
  payload: IUpdateServiceRequestStatusPayload,
) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const isExist = await prisma.serviceRequest.findFirst({
    where: { id, providerId: provider.id },
  });

  if (!isExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Service request not found or unauthorized",
    );
  }

  if (isExist.status !== RequestStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot update status from ${isExist.status} to ${payload.status}`,
    );
  }
  if (
    payload.status === RequestStatus.COMPLETED ||
    payload.status === RequestStatus.IN_PROGRESS ||
    payload.status === RequestStatus.PENDING
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can only ACCEPTED or CANCELED the request`,
    );
  }

  const result = await prisma.serviceRequest.update({
    where: { id },
    data: { status: payload.status },
  });
  
  return result;
};

export const ServiceRequestService = {
  createServiceRequest,
  getMyServiceRequests,
  getProviderServiceRequests,
  updateServiceRequestStatus,
};
