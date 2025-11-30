import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../shared/utils/jwt.util";
import {
  IRegisterInput,
  ILoginInput,
  RegisterResult,
  LoginResult,
} from "./auth.interface";
import ApiError from "../../shared/errors/ApiError";
import { comparePassword, hashPassword } from "../../shared/utils/bcrypt.util";

const prisma = new PrismaClient();

class AuthService {
  /**
   * Register a new user
   */
  async register(data: IRegisterInput): Promise<RegisterResult> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists with this email");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
    };
  }

  /**
   * Login existing user
   */
  async login(data: ILoginInput): Promise<LoginResult> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }
}

export default new AuthService();
