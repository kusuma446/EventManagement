import { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getReviewsByEventService,
} from "../services/review.service";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createReviewService(req);
    res.status(201).json({ message: "Review submitted", data });
  } catch (error) {
    next(error);
  }
};

export const getReviewsByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getReviewsByEventService(req);
    res.status(200).json({ reviews: data });
  } catch (error) {
    next(error);
  }
};
