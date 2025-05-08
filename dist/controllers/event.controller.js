"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.updateEvent = exports.searchEvents = exports.getMyEvents = exports.getEventDetail = exports.getAllEvents = exports.createEvent = void 0;
const event_service_1 = require("../services/event.service");
const createEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, event_service_1.createEventService)(req);
        res.status(201).json({ message: "Event created", data });
    }
    catch (error) {
        next(error);
    }
});
exports.createEvent = createEvent;
const getAllEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔍 Organizer payload:", req.user);
        const data = yield (0, event_service_1.getAllEventsService)(req);
        res.status(200).json({ events: data });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllEvents = getAllEvents;
const getEventDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, event_service_1.getEventDetailService)(req.params.id);
        res.status(200).json({ event: data });
    }
    catch (error) {
        next(error);
    }
});
exports.getEventDetail = getEventDetail;
// get event untuk ORGANIZER
const getMyEvents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, event_service_1.getMyEventsService)(req);
        res.status(200).json({ message: "My events retrieved successfully", data });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyEvents = getMyEvents;
const eventService = __importStar(require("../services/event.service"));
const searchEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        const events = yield eventService.findEventsByTitle(query);
        res.json(events);
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.searchEvents = searchEvents;
const updateEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, event_service_1.updateEventService)(req);
        res.status(200).json({ message: "Event updated successfully", data });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEvent = updateEvent;
