import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOrganizer } from "../middlewares/auth.middleware";
import {
  createEvent,
  getAllEvents,
  getEventDetail,
  getMyEvents,
  searchEvents,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createEventSchema } from "../schemas/event.schema";

const router = express.Router();

router.get("/events", searchEvents);
router.get("/:id", getEventDetail);
router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  ReqValidator(createEventSchema),
  createEvent
);
router.get("/me", isAuthenticated, isOrganizer, getMyEvents);

export default router;
