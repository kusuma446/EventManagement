import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { getOrganizerDashboard } from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/organizer", isAuthenticated, getOrganizerDashboard);

export default router;
