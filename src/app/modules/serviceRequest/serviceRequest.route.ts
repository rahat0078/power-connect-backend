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



export const ServiceRequestRoutes = router;