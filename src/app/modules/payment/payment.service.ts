import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { PaymentMethod, PaymentStatus, RequestStatus } from "../../../generated/prisma/enums";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import Stripe from "stripe";
import { AuditLogService } from "../auditLog/auditLog.service";

const createPaymentCheckoutIntoDB = async (
  userId: string,
  serviceRequestId: string,
) => {
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: {
      service: {
        select: { name: true, price: true },
      },
    },
  });

  if (!serviceRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
  }

  if (serviceRequest.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized for this request",
    );
  }

  if (serviceRequest.status !== RequestStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can only be initiated for ACCEPTED service requests",
    );
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { serviceRequestId },
  });

  if (existingPayment && existingPayment.status === PaymentStatus.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment has already been completed",
    );
  }

  
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: serviceRequest.service.name,
          },
          unit_amount: Math.round(Number(serviceRequest.totalAmount) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.frontend_url}/dashboard/resident/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/dashboard/resident/payments/cancel?success=false`,
    metadata: {
      serviceRequestId,
      userId,
    },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        transactionId: session.id,
        createdAt: new Date(),
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        userId,
        serviceRequestId,
        amount: serviceRequest.totalAmount,
        transactionId: session.id,
        paymentMethod: PaymentMethod.STRIPE,
        status: PaymentStatus.PENDING,
      },
    });
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    metadata: { serviceRequestId, userId },
  };
};

const createPaymentConfirmIntoDB = async (session: Stripe.Checkout.Session) => {
  if (session.payment_status !== 'paid') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment is not completed');
  }

  const payment = await prisma.payment.findFirst({
    where: { transactionId: session.id },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment record not found');
  }

  if (payment.status === PaymentStatus.PAID) {
    return payment;
  }

  
  const transactionResult = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
      },
    });

    await tx.serviceRequest.update({
      where: { id: payment.serviceRequestId },
      data: {
        status: RequestStatus.IN_PROGRESS,
      },
    });

    return updatedPayment;
  });

  await AuditLogService.createAuditLog({
    userId: payment.userId,
    action: 'PAYMENT_SUCCESS',
    entity: 'Payment',
    entityId: payment.id,
    metadata: {
      transactionId: session.id,
      amount: payment.amount,
      serviceRequestId: payment.serviceRequestId,
    },
  });

  return transactionResult;
};

export const PaymentService = {
  createPaymentCheckoutIntoDB,
  createPaymentConfirmIntoDB
};
