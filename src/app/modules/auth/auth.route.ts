import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./auth.validation";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/register",
  validateRequest(UserValidation.RegistrationZodSchema),
  AuthController.registerUser,
);

router.post(
  "/verify-email",
  validateRequest(UserValidation.VerificationZodSchema),
  AuthController.verifyUserEmail,
);

router.post(
  "/login",
  validateRequest(UserValidation.LoginZodSchema),
  AuthController.loginUser,
);
router.get(
  "/me",
  auth(Role.ADMIN, Role.PROVIDER, Role.RESIDENT),
  AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);

export const AuthRoutes = router;
