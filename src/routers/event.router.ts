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
  exploreEvents,
} from "../controllers/event.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createEventSchema, updateEventSchema } from "../schemas/event.schema";
import { Multer } from "../utils/multer";

const router = express.Router();
const uploadEventImage = Multer("diskStorage", "event-", "image");

router.get("/", searchEvents);
router.get("/show", SHowEventsController);
router.get("/explore", exploreEvents);

router.get("/me", isAuthenticated, isOrganizer, getMyEvents);
router.get("/:id", getEventDetail);
router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  uploadEventImage.single("file"),
  ReqValidator(createEventSchema),
  createEvent
);
router.put(
  "/:id",
  isAuthenticated,
  isOrganizer,
  uploadEventImage.single("file"),
  ReqValidator(updateEventSchema),
  updateEvent
);

export default router;
