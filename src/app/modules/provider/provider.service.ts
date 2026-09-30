import httpStatus from "http-status";
import {
  ICreateProviderProfilePayload,
  IUpdateProviderProfilePayload,
} from "./provider.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Role } from "../../../generated/prisma/enums";
import { AuditLogService } from "../auditLog/auditLog.service";
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../constants/audit.constant";

const applyAsProvider = async (
  userId: string,
  payload: ICreateProviderProfilePayload,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (!user.emailVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your email must be verified before applying to become a provider",
    );
  }

  if (user.role === Role.PROVIDER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already a registered provider",
    );
  }

  const existingProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already submitted a provider application",
    );
  }

  const result = await prisma.providerProfile.create({
    data: {
      userId,
      businessName: payload.businessName,
      phone: payload.phone,
      address: payload.address,
      isApproved: false,
    },
  });

  return result;
};

const getPendingProviders = async () => {
  const pendingProviders = await prisma.providerProfile.findMany({
    where: {
      isApproved: false,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          emailVerified: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return pendingProviders;
};

const approveProvider = async (
  providerProfileId: string,
  adminUserId: string,
) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
    include: { user: true },
  });

  if (!providerProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider application not found");
  }

  if (providerProfile.isApproved) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Provider application is already approved",
    );
  }

  if (!providerProfile.user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Associated user account no longer exists",
    );
  }

  const [updatedProfile, updatedUser] = await prisma.$transaction([
    prisma.providerProfile.update({
      where: { id: providerProfileId },
      data: { isApproved: true },
    }),
    prisma.user.update({
      where: { id: providerProfile.userId },
      data: { role: Role.PROVIDER },
    }),
  ]);

  try {
    await AuditLogService.createAuditLog({
      userId: adminUserId,
      action: AUDIT_ACTION.APPROVE,
      entity: AUDIT_ENTITY.PROVIDER_PROFILE,
      entityId: updatedProfile.id,
      metadata: {
        providerUserId: providerProfile.userId,
        businessName: updatedProfile.businessName,
        previousApprovalStatus: false,
        newApprovalStatus: true,
        previousRole: providerProfile.user.role,
        newRole: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Audit log failed during provider approval:", error);
  }

  return {
    profile: updatedProfile,
    userRole: updatedUser.role,
  };
};

const rejectProvider = async (
  providerProfileId: string,
  adminUserId: string,
) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
  });

  if (!providerProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider application not found");
  }

  if (providerProfile.isApproved) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot reject an already approved provider profile",
    );
  }

  // Delete profile on rejection (Simplest approach given Boolean schema)
  const deletedProfile = await prisma.providerProfile.delete({
    where: { id: providerProfileId },
  });

  try {
    await AuditLogService.createAuditLog({
      userId: adminUserId,
      action: AUDIT_ACTION.REJECT,
      entity: AUDIT_ENTITY.PROVIDER_PROFILE,
      entityId: providerProfileId,
      metadata: {
        providerUserId: providerProfile.userId,
        businessName: providerProfile.businessName,
        reason: "Application rejected by admin and removed",
      },
    });
  } catch (error) {
    console.error("Audit log failed during provider rejection:", error);
  }

  return deletedProfile;
};

const getMyProviderProfile = async (userId: string) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      phone: true,
      address: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
        },
      },
    },
  });

  if (!providerProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  return providerProfile;
};

const updateMyProviderProfile = async (
  userId: string,
  payload: IUpdateProviderProfilePayload,
) => {
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!providerProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
  }

  const updatedProfile = await prisma.providerProfile.update({
    where: { userId },
    data: {
      ...(payload.businessName && { businessName: payload.businessName }),
      ...(payload.phone && { phone: payload.phone }),
      ...(payload.address && { address: payload.address }),
    },
  });

  return updatedProfile;
};

export const ProviderService = {
  applyAsProvider,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
};
