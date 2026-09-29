/** biome-ignore-all lint/style/useNodejsImportProtocol: <ok> */

import bcrypt from "bcryptjs";
import { type TokenPayload } from "google-auth-library";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import type {
  IGoogleLoginPayload,
  ILoginUserPayload,
  IRegisterPayload,
  IRequestUser,
  IVerifyUserPayload,
} from "./auth.interface";
import crypto from "crypto";
import ejs from "ejs";
import path from "path";
import { AppError } from "../../utils/AppError";
import { redisClient } from "../../lib/redis";
import { RequestUser } from "../../types";
import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
import { googleClient } from "../../lib/googleAuth";

const registerUser = async (payload: IRegisterPayload) => {
  const { name, password } = payload;

  const email = payload.email.trim().toLowerCase();

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const expirationMinutes = 5 * 60;

  const otpKey = `power-connect:user-registration-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();
  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expirationMinutes,
    },
  });

  const redisUserDataPayload = {
    name,
    email,
    password: hashedPassword,
  };
  const registrationKey = `power-connect:registration-data:${email}`;

  await redisClient.set(registrationKey, JSON.stringify(redisUserDataPayload), {
    expiration: {
      type: "EX",
      value: expirationMinutes,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/registration-otp.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name,
    email,
    otpValue,
    expirationMinutes,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: email,
    subject: "Power Connect: Email Verification",
    html,
  });

  return {};
};

const verifyUserEmail = async (payload: IVerifyUserPayload) => {
  const email = payload.email.trim().toLowerCase();
  const { otp } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new AppError(409, "User Already exist");
  }

  const otpKey = `power-connect:user-registration-otp:${email}`;

  const registrationKey = `power-connect:registration-data:${email}`;

  // verify otp

  const redisOtpKey = await redisClient.get(otpKey);

  if (!redisOtpKey) {
    throw new AppError(400, "OTP expired. Please request a new OTP.");
  }

  if (redisOtpKey !== otp) {
    throw new AppError(400, "Invalid OTP");
  }

  const registrationData = await redisClient.get(registrationKey);
  if (!registrationData) {
    throw new AppError(
      410,
      "Registration session expired. Please register again.",
    );
  }

  const registerData: IRegisterPayload = JSON.parse(registrationData);

  const user = await prisma.user.create({
    data: {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      role: Role.RESIDENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    omit: { password: true },
  });

  await redisClient.del(otpKey);
  await redisClient.del(registrationKey);

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  const templatePath = path.join(
    process.cwd(),
    "src/app/templates/welcome-email.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: user.name,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: user.email,
    subject: "Email Verification successfully",
    html,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { password } = payload;
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(403, "Your account has been blocked");
  }

  if (user.isDeleted) {
    throw new AppError(410, "Your account has been deleted");
  }

  if (user.password === null && user.googleId !== null) {
    throw new AppError(
      400,
      "This account was registered with Google. Please login with Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: RequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(404, "User not found");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(
      401,
      config.node_env === "development"
        ? verifiedRefreshToken.error
        : "Invalid or expired refresh token",
    );
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(410, "Your account has been deleted");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "Your account is not active");
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
  let googleIdTokenPayload: TokenPayload | null | undefined = null;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });

    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log("Google ID Token Verification Failed", error);

    throw new AppError(401, "Invalid or expired Google ID token");
  }

  if (!googleIdTokenPayload) {
    throw new AppError(401, "Invalid or expired Google ID token");
  }

  if (!googleIdTokenPayload.email) {
    throw new AppError(400, "Google email not found");
  }

  if (!googleIdTokenPayload.name) {
    throw new AppError(400, "Google user name not found");
  }

  const ifUserExistWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      googleId: googleIdTokenPayload.sub,
    },
  });

  let user = ifUserExistWithGoogleAuth;

  if (!ifUserExistWithGoogleAuth) {
    const ifUserExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        authProvider: AuthProvider.CREDENTIAL,
      },
    });

    if (ifUserExistWithCredentials) {
      if (!ifUserExistWithCredentials.emailVerified) {
        throw new AppError(403, "Email is not verified");
      }

      if (ifUserExistWithCredentials.status === UserStatus.BLOCKED) {
        throw new AppError(403, "Your account has been blocked");
      }

      if (ifUserExistWithCredentials.isDeleted) {
        throw new AppError(410, "Your account has been deleted");
      }

      user = await prisma.user.update({
        where: {
          id: ifUserExistWithCredentials.id,
        },
        data: {
          googleId: googleIdTokenPayload.sub,
        },
      });
    } else {
      // Google Register
      user = await prisma.user.create({
        data: {
          name: googleIdTokenPayload.name,
          email: googleIdTokenPayload.email,
          role: Role.RESIDENT,
          googleId: googleIdTokenPayload.sub,
          authProvider: AuthProvider.GOOGLE,
          emailVerified: true,
        },
      });

      const templatePath = path.join(
        process.cwd(),
        "src/app/templates/welcome-email.ejs",
      );

      const html = await ejs.renderFile(templatePath, {
        name: googleIdTokenPayload.name,
      });

      await transporter.sendMail({
        from: config.sender_email,
        to: googleIdTokenPayload.email,
        subject: "Welcome To Power Connect",
        html,
      });
    }
  }

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(403, "Your account has been blocked");
  }

  if (user.isDeleted) {
    throw new AppError(410, "Your account has been deleted");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerUser,
  verifyUserEmail,
  loginUser,
  getMe,
  refreshToken,
  googleLogin,
};
