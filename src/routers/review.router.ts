import express from "express";
import { isAuthenticated, isCustomer } from "../middlewares/auth.middleware";
import {
  createReview,
  getReviewsByEvent,
} from "../controllers/review.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createReviewSchema } from "../schemas/review.schema";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isCustomer,
  ReqValidator(createReviewSchema),
  createReview
);
router.get("/event/:event_id", getReviewsByEvent);

export default router;
