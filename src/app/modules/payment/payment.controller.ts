import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status";

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

export const PaymentController = {
  createPaymentCheckout,
};
