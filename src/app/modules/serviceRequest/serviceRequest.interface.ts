import { RequestStatus } from "../../../generated/prisma/enums";

export type ICreateServiceRequestPayload = {
  serviceId: string;
  address: string;
  scheduledAt: string; 
};

export type IUpdateServiceRequestStatusPayload = {
  status: RequestStatus;
};

