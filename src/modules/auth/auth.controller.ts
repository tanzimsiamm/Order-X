import { Request, Response } from "express";
import authService from "./auth.service";
import { sendSuccessResponse } from "../../shared/utils/response.util";
import catchAsync from "../../shared/utils/catchAsync";
import { IAuthRequest } from "../../shared/interfaces/common.interface";

class AuthController {
  /**
   * Register new user
   * @route POST /api/auth/register
   */
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: "User registered successfully",
      data: result,
    });
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: result,
    });
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getProfile = catchAsync(async (req: IAuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.getUserById(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: user,
    });
  });
}

export default new AuthController();
