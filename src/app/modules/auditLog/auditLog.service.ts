import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateAuditLogPayload } from "./auditLog.interface";


const createAuditLog = async (payload: ICreateAuditLogPayload) => {
  try {
    const { userId, action, entity, entityId, metadata } = payload;

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ?? Prisma.JsonNull,
      },
    });

    return auditLog;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
};

export const AuditLogService = {
  createAuditLog,
};