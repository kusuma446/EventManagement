import { Request, Response, NextFunction } from "express";
import {
  getOrganizerDashboardService,
  getAttendeesPerEvent,
  getStatisticsSummaryService,
  getMonthlyRevenueByYear,
} from "../services/dashboard.service";

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

export const getAttendees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAttendeesPerEvent(req);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getStatisticsSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getStatisticsSummaryService(req);
    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenueController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getMonthlyRevenueByYear(req);
    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};
