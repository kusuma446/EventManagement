"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyRevenueController = exports.getStatisticsSummaryController = exports.getAttendees = exports.getOrganizerDashboard = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const getOrganizerDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, dashboard_service_1.getOrganizerDashboardService)(req);
        res.status(200).json({ dashboard: data });
    }
    catch (error) {
        next(error);
    }
});
exports.getOrganizerDashboard = getOrganizerDashboard;
const getAttendees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, dashboard_service_1.getAttendeesPerEvent)(req);
        res.status(200).json({ data });
    }
    catch (error) {
        next(error);
    }
});
exports.getAttendees = getAttendees;
const getStatisticsSummaryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, dashboard_service_1.getStatisticsSummaryService)(req);
        res.status(200).json({ status: "success", data });
    }
    catch (error) {
        next(error);
    }
});
exports.getStatisticsSummaryController = getStatisticsSummaryController;
const getMonthlyRevenueController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, dashboard_service_1.getMonthlyRevenueByYear)(req);
        res.status(200).json({ status: "success", data });
    }
    catch (error) {
        next(error);
    }
});
exports.getMonthlyRevenueController = getMonthlyRevenueController;
