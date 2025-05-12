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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExploreEventsService = exports.ShowEventsService = exports.updateEventService = exports.findEventsByTitle = exports.getMyEventsService = exports.getEventDetailService = exports.getAllEventsService = exports.createEventService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createEventService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { name, description, category, location, Pay, start_date, end_date, available_seats, } = req.body;
    // Cek hanya ORGANIZER yang boleh buat event
    if (user.role !== "ORGANIZER") {
        throw { status: 403, message: "Only organizer can create event" };
    }
    // Validasi pastikan tanggal start sebelum tanggal end
    if (new Date(start_date) >= new Date(end_date)) {
        throw { status: 400, message: "Start date must be before end date" };
    }
    const newEvent = yield prisma_1.default.event.create({
        data: {
            name,
            description,
            category,
            location,
            Pay,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            available_seats,
            organizer_id: user.id, // Relasi ke events pada user
        },
    });
    return newEvent;
});
exports.createEventService = createEventService;
const getAllEventsService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    return prisma_1.default.event.findMany({
        where: category
            ? { category: { equals: String(category), mode: "insensitive" } }
            : undefined,
        include: {
            ticket_types: true, // Melihat jenis tiket dari event
            reviews: true, // Melihat review terhadap event
        },
    });
});
exports.getAllEventsService = getAllEventsService;
const getEventDetailService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event.findUnique({
        where: { id },
        include: {
            ticket_types: true, // Melihat semua jenis tiket
            reviews: {
                // Melihat review
                include: {
                    user: { select: { first_name: true, last_name: true } }, // Termasuk nama reviewer
                },
            },
            organizer: {
                // Informasi penyelenggara event
                select: { first_name: true, last_name: true },
            },
        },
    });
    if (!event)
        throw { status: 404, message: "Event not found" };
    return event;
});
exports.getEventDetailService = getEventDetailService;
const getMyEventsService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!organizerId) {
        throw { status: 401, message: "Unauthorized" };
    }
    const events = yield prisma_1.default.event.findMany({
        where: {
            organizer_id: organizerId,
        },
        select: {
            id: true,
            name: true,
            category: true,
            location: true,
            available_seats: true,
            start_date: true,
            end_date: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
    console.log("📝 Events found:", events.length);
    return events;
});
exports.getMyEventsService = getMyEventsService;
const findEventsByTitle = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const keywords = query
        .split(" ")
        .map((word) => word.trim())
        .filter((word) => word.length > 0);
    const events = yield prisma_1.default.event.findMany({
        where: {
            OR: keywords.flatMap((word) => [
                {
                    name: {
                        contains: word,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        contains: word,
                        mode: "insensitive",
                    },
                },
            ]),
        },
        take: 10,
        orderBy: {
            start_date: "asc",
        },
        select: {
            id: true,
            name: true,
            category: true,
            start_date: true,
            image: true, // URL Cloudinary
            organizer: {
                select: {
                    first_name: true,
                    last_name: true,
                    profile_pict: true, // relative path
                },
            },
            ticket_types: {
                select: {
                    price: true,
                },
                orderBy: {
                    price: "asc",
                },
                take: 1,
            },
        },
    });
    return events;
});
exports.findEventsByTitle = findEventsByTitle;
const updateEventService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, start_date, end_date, location } = req.body;
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!user_id) {
        throw { status: 401, message: "Unauthorized" };
    }
    const event = yield prisma_1.default.event.findFirst({
        where: {
            id,
            organizer_id: user_id,
        },
    });
    if (!event) {
        throw { status: 404, message: "Event not found" };
    }
    const updated = yield prisma_1.default.event.update({
        where: { id },
        data: {
            name,
            start_date,
            end_date,
            location,
        },
    });
    return updated;
});
exports.updateEventService = updateEventService;
// SHow events
const ShowEventsService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, featured } = req.query;
    const filter = {};
    if (category) {
        filter.category = {
            equals: String(category),
            mode: "insensitive",
        };
    }
    if (featured !== undefined) {
        filter.Pay = featured === "true";
    }
    const events = yield prisma_1.default.event.findMany({
        where: filter,
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            name: true,
            category: true,
            location: true,
            start_date: true,
            organizer: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            ticket_types: {
                select: { price: true },
                orderBy: { price: "asc" },
                take: 1,
            },
        },
    });
    return events;
});
exports.ShowEventsService = ShowEventsService;
// EXplore
const getExploreEventsService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, location } = req.query;
    const filters = {};
    if (category) {
        filters.category = {
            equals: String(category),
            mode: "insensitive",
        };
    }
    if (location) {
        filters.location = {
            contains: String(location),
            mode: "insensitive",
        };
    }
    return prisma_1.default.event.findMany({
        where: filters,
        orderBy: {
            created_at: "desc",
        },
        include: {
            ticket_types: {
                select: { price: true },
                orderBy: { price: "asc" },
                take: 1,
            },
            organizer: {
                select: {
                    first_name: true,
                    last_name: true,
                    profile_pict: true,
                },
            },
        },
    });
});
exports.getExploreEventsService = getExploreEventsService;
