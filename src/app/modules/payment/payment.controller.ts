import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import Stripe from "stripe";

const createPaymentCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { serviceRequestId } = req.body;
    const result = await PaymentService.createPaymentCheckoutIntoDB(
      userId,
      serviceRequestId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment checkout session created successfully",
      data: result,
    });
  },
);

const confirmPaymentFromFrontend = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const updatedPayment = await PaymentService.createPaymentConfirmIntoDB(session);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment confirmed successfully and service is now IN_PROGRESS',
    data: updatedPayment,
  });
});

const handleStripeWebhook = async (req: Request, res: Response) => {
  let event = req.body;

  if (config.endpointSecret) {
    const signature = req.headers['stripe-signature'] as string;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.endpointSecret
      );
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await PaymentService.createPaymentConfirmIntoDB(session);
  }

  return res.status(200).send();
};

export const PaymentController = {
  createPaymentCheckout,
  handleStripeWebhook,
  confirmPaymentFromFrontend
};
