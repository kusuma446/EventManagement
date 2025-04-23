import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  createReview,
  getReviewByEvent,
} from "../controllers/review.controller";

const router = express.Router();

router.post("/", isAuthenticated, createReview);
router.get("/event/:eventId", getReviewByEvent);

export default router;
