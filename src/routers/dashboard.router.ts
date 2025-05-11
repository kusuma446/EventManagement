import express from "express";
import { isAuthenticated, isOrganizer } from "../middlewares/auth.middleware";
import {
  getOrganizerDashboard,
  getAttendees,
  getStatisticsSummaryController,
  getMonthlyRevenueController,
} from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/organizer", isAuthenticated, isOrganizer, getOrganizerDashboard);
router.get("/attendees", isAuthenticated, isOrganizer, getAttendees);
router.get(
  "/statistics/summary",
  isAuthenticated,
  isOrganizer,
  getStatisticsSummaryController
);
router.get(
  "/statistics",
  isAuthenticated,
  isOrganizer,
  getMonthlyRevenueController
);

export default router;
