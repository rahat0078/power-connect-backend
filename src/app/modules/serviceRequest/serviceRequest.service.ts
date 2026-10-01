import httpStatus from "http-status";
import { ICreateServiceRequestPayload } from "./serviceRequest.interface";
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

export const ServiceRequestService = {
  createServiceRequest,
  getMyServiceRequests,
};
