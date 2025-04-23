import { Request, Response } from "express";
import * as reviewService from "../services/review.service";

export const createReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { event_id, rating, comment } = req.body;

    const canReview = await reviewService.hasUserPurchased(user?.id, event_id);
    if (!canReview) {
      res
        .status(403)
        .json({ message: "you can only review events you've attended" });
      return;
    }

    const review = await reviewService.createReview({
      user_id: user.id,
      event_id,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReviewByEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const reviews = await reviewService.getReviewsByEvent(eventId);

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
