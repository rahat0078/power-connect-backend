import { Prisma } from "../../../generated/prisma/client";

export interface ICreateAuditLogPayload {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}