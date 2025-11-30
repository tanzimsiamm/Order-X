import { Response } from "express";
import adminService from "./admin.service";
import { sendSuccessResponse } from "../../shared/utils/response.util";
import catchAsync from "../../shared/utils/catchAsync";
import { IAuthRequest } from "../../shared/interfaces/common.interface";

class AdminController {
  /**
   * Update order status
   * @route PATCH /api/admin/orders/:id/status
   */
  updateOrderStatus = catchAsync(async (req: IAuthRequest, res: Response) => {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const updatedOrder = await adminService.updateOrderStatus(
      id as string,
      orderStatus
    );

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Order status updated successfully and user notified",
      data: updatedOrder,
    });
  });

  /**
   * Get all orders with pagination
   * @route GET /api/admin/orders
   */
  getAllOrders = catchAsync(async (req: IAuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as string;

    const result = await adminService.getAllOrders(
      page,
      limit,
      status,
      paymentStatus
    );

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Orders retrieved successfully",
      data: result,
    });
  });

  /**
   * Get order by ID
   * @route GET /api/admin/orders/:id
   */
  getOrderById = catchAsync(async (req: IAuthRequest, res: Response) => {
    const { id } = req.params;
    const order = await adminService.getOrderById(id as string);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Order retrieved successfully",
      data: order,
    });
  });

  /**
   * Get order statistics
   * @route GET /api/admin/stats
   */
  getOrderStats = catchAsync(async (req: IAuthRequest, res: Response) => {
    const stats = await adminService.getOrderStats();

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Order statistics retrieved successfully",
      data: stats,
    });
  });

  /**
   * Delete order
   * @route DELETE /api/admin/orders/:id
   */
  deleteOrder = catchAsync(async (req: IAuthRequest, res: Response) => {
    const { id } = req.params;
    await adminService.deleteOrder(id as string);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Order deleted successfully",
    });
  });
}

export default new AdminController();
