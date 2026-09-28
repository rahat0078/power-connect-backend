import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    // No token
    if (!token) {
      throw new AppError(
        401,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    // Verify token
    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(401, verifiedToken.error);
    }

    const { email, name, userId, role } = verifiedToken.data as JwtPayload;

    // Role check
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        403,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    // Check user existence
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        
      },
    });

    if (!user) {
      throw new AppError(404, "User not found. Please log in again.");
    }

    // Check blocked user
    if (user.status === "BLOCKED") {
      throw new AppError(
        403,
        "Your account has been blocked. Please contact support.",
      );
    }

    req.user = {
      email,
      name,
      userId,
      role,
    };

    next();
  });
};
