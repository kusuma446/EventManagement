"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = express_1.default.Router();
router.get("/organizer", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, dashboard_controller_1.getOrganizerDashboard);
router.get("/attendees", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, dashboard_controller_1.getAttendees);
router.get("/statistics/summary", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, dashboard_controller_1.getStatisticsSummaryController);
router.get("/statistics", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, dashboard_controller_1.getMonthlyRevenueController);
exports.default = router;
