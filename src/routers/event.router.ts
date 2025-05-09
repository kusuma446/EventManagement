import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOrganizer } from "../middlewares/auth.middleware";
import {
  createEvent,
  getAllEvents,
  getEventDetail,
  getMyEvents,
  searchEvents,
  updateEvent,
  SHowEventsController,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createEventSchema, updateEventSchema } from "../schemas/event.schema";

const router = express.Router();

router.get("/", searchEvents);
router.get("/show", SHowEventsController);
router.get("/me", isAuthenticated, isOrganizer, getMyEvents);
router.get("/:id", getEventDetail);
router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  ReqValidator(createEventSchema),
  createEvent
);
router.put(
  "/:id",
  isAuthenticated,
  isOrganizer,
  ReqValidator(updateEventSchema),
  updateEvent
);

export default router;
