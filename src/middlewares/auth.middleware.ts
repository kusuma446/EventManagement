import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const secret_token: string = JWT_SECRET ?? "devsecret";

interface AuthPayLoad {
  id: string;
  role: Role;
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Unauthorized - missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, secret_token) as AuthPayLoad;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - invalid token" });
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
  if (
    !req.user ||
    (req.user.role !== "CUSTOMER" && req.user.role !== "ORGANIZER")
  ) {
    res.status(403).json({ message: "Forbidden - customer access only" });
  }
  next();
};
