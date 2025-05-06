import express from "express";
import { isAuthenticated, isOrganizer } from "../middlewares/auth.middleware";
import { getOrganizerDashboard } from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/organizer", isAuthenticated, isOrganizer, getOrganizerDashboard);

export default router;
