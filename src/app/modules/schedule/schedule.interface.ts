import { ScheduleStatus } from "../../../generated/prisma/enums";

export interface ICreateSchedulePayload {
  area: string;
  startTime: string | Date;
  endTime: string | Date;
  description?: string;
}

export interface IUpdateSchedulePayload {
  area?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  description?: string;
  status?: ScheduleStatus;
}

export interface IScheduleQuery {
  searchTerm?: string;
  area?: string;
  status?: ScheduleStatus;
  startDate?: string;
  endDate?: string;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}