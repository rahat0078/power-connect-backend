import express from 'express';
import { AdminController } from './admin.controller';
import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/checkAuth';

const router = express.Router();

router.get(
  '/users',
  auth(Role.ADMIN),
  AdminController.getAllUsers
);

router.patch(
  '/users/role/:id',
  auth(Role.ADMIN),
  AdminController.updateUserRole
);

router.get(
  '/dashboard-stats',
  auth(Role.ADMIN),
  AdminController.getDashboardStats
);

router.get(
  '/audit-logs',
  auth(Role.ADMIN),
  AdminController.getAuditLogs
);

export const AdminRoutes = router;