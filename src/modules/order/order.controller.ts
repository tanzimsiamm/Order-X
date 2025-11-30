import { Response } from "express";
import orderService from "./order.service";
import { sendSuccessResponse } from "../../shared/utils/response.util";
import catchAsync from "../../shared/utils/catchAsync";
import { IAuthRequest } from "../../shared/interfaces/common.interface";

class OrderController {
  /**
   * Create new order
   * @route POST /api/orders
   */
  createOrder = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const result = await orderService.createOrder(userId, req.body);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: "Order created successfully",
      data: result,
    });
  });

  /**
   * Get user's orders
   * @route GET /api/orders
   */
  getUserOrders = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const orders = await orderService.getUserOrders(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Orders retrieved successfully",
      data: orders,
    });
  });

  /**
   * Get order by ID
   * @route GET /api/orders/:id
   */
  getOrderById = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const order = await orderService.getOrderById(id as any, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Order retrieved successfully",
      data: order,
    });
  });
}

export default new OrderController();
