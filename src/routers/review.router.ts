import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  createReview,
  getReviewsByEvent,
} from "../controllers/review.controller";

const router = express.Router();

router.post("/", isAuthenticated, createReview);
router.get("/event/:eventId", getReviewsByEvent);

export default router;
