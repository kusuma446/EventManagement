import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { AuthPayload } from "../types/express";

const secret_token: string = JWT_SECRET ?? "devsecret";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("Unauthorized");

    const payload = jwt.verify(token, String(secret_token));

    if (!payload) throw new Error("Invalid token");

    req.user = payload as AuthPayload;

    next();
  } catch (error) {
    next(error);
  }
};

export const isOrganizer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "ORGANIZER") {
    res.status(403).json({ message: "Forbidden - organizer access only" });
    return;
  }
  next();
};

export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "CUSTOMER") {
    res.status(403).json({ message: "Forbidden - customer access only" });
  }
  next();
};
