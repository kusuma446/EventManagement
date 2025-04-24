import { Request, Response, NextFunction } from "express";
import { getOrganizerDashboardService } from "../services/dashboard.service";

export const getOrganizerDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getOrganizerDashboardService(req);
    res.status(200).json({ dashboard: data });
  } catch (error) {
    next(error);
  }
};
