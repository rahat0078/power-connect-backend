import express from 'express';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';
import { auth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import { validateRequest } from '../../middleware/validateRequest';

const router = express.Router();

router.post(
  '/create-checkout',
  auth(Role.RESIDENT),
  validateRequest(PaymentValidation.createPaymentCheckoutZodSchema),
  PaymentController.createPaymentCheckout
);
router.post(
  '/confirm',
  auth(Role.RESIDENT, Role.ADMIN),
  validateRequest(PaymentValidation.confirmPaymentZodSchema),
  PaymentController.confirmPaymentFromFrontend
);

router.get(
  '/my-history',
  auth(Role.RESIDENT),
  PaymentController.getMyAllPaymentHistory
);

router.get(
  '/my-history/:id',
  auth(Role.RESIDENT, Role.PROVIDER, Role.ADMIN),
  PaymentController.getMySinglePayment
);

export const PaymentRoutes = router;