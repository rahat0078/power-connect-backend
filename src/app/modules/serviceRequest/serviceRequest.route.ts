import express from 'express';
import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { ServiceRequestValidation } from './serviceRequest.validation';
import { ServiceRequestController } from './serviceRequest.controller';

const router = express.Router();


router.post(
  '/',
  auth(Role.RESIDENT),
  validateRequest(ServiceRequestValidation.createServiceRequestZodSchema),
  ServiceRequestController.createServiceRequest
);

router.get(
  '/my-requests',
  auth(Role.RESIDENT),
  ServiceRequestController.getMyServiceRequests
);

router.get(
  '/provider-requests',
  auth(Role.PROVIDER),
  ServiceRequestController.getProviderServiceRequests
);

router.patch(
  '/status/:id',
  auth(Role.PROVIDER),
  validateRequest(ServiceRequestValidation.updateServiceRequestStatusZodSchema),
  ServiceRequestController.updateServiceRequestStatus
);

router.patch(
  '/complete/:id',
  auth(Role.PROVIDER),
  ServiceRequestController.completeServiceRequest
);

router.patch(
  '/cancel-resident/:id',
  auth(Role.RESIDENT),
  ServiceRequestController.cancelServiceRequest
);

router.get(
  '/common/:id',
  auth(Role.RESIDENT, Role.PROVIDER, Role.ADMIN),
  ServiceRequestController.getSingleServiceRequest
);

export const ServiceRequestRoutes = router;