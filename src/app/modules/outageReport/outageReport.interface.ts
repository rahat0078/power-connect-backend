import { OutageStatus } from "../../../generated/prisma/enums";

export interface ICreateOutageReportPayload {
  area: string;
  description: string;
}

export interface IUpdateOutageReportStatusPayload {
  status: OutageStatus;
}

export interface IOutageReportQuery {
  searchTerm?: string;
  area?: string;
  status?: OutageStatus;
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}