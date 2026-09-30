import { ServiceStatus } from "../../../generated/prisma/enums";



export type ICreatePowerServicePayload = {
  name: string;
  description: string;
  price: number;
  capacity: string;
};

export type IUpdatePowerServicePayload = {
  name?: string;
  description?: string;
  price?: number;
  capacity?: string;
};

export type IUpdatePowerServiceStatusPayload = {
  status: ServiceStatus;
};

export type IPowerServiceFilterRequest = {
  searchTerm?: string;
  status?: ServiceStatus;
  minPrice?: string;
  maxPrice?: string;
  limit?: number;
  page?: number;
  
};
