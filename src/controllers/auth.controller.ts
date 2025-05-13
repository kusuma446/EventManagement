import { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  updateProfileService,
  changePasswordService,
  forgotPasswordService,
  resetPasswordService,
  getAuthenticatedUserService,
} from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await registerService(req.body);
    res.status(201).json({ message: "User registered", data });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await loginService(req.body);

    // Set JWT token in HTTP-only cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: "Login success", user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await updateProfileService(req);
    res.status(200).json({ message: "Profile updated", data });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await changePasswordService(req);
    res.status(200).json({ message: "Password changed successfully", data });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await forgotPasswordService(req);
    res.status(200).json({ message: "Reset password link sent", data });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await resetPasswordService(req);
    res.status(200).json({ message: "Password reset successfully", data });
  } catch (err) {
    next(err);
  }
};

export const getAuthenticatedUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAuthenticatedUserService(req);
    res.status(200).json({ message: "Authenticated user retrieved", data });
  } catch (err) {
    next(err);
  }
};
