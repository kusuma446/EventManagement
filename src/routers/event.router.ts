import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  createEvent,
  listEvents,
  getEventDetail,
} from "../controllers/event.controller";

const router = express.Router();

router.get("/", listEvents);
router.get("/:id", getEventDetail);
router.post("/", isAuthenticated, createEvent);

export default router;
