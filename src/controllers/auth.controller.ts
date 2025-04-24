import { Request, Response, NextFunction } from "express";
import { registerService, loginService } from "../services/auth.service";

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
    const data = await loginService(req.body);
  } catch (error) {
    next(error);
  }
};
