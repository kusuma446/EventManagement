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
exports.getReviewsByEventService = exports.createReviewService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createReviewService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Hanya customer yang bisa buat review
    if (user.role !== "CUSTOMER") {
        throw { status: 403, message: "Only customers can submit reviews" };
    }
    const { event_id, rating, comment } = req.body;
    // Ambil semua ticketType.id yang terkait dengan event tersebut
    const tickets = yield prisma_1.default.ticketType.findMany({
        where: { event_id },
        select: { id: true },
    });
    const ticketIds = tickets.map((t) => t.id);
    // Cek apakah user punya transaksi dengan status DONE terhadap salah satu ticket type dari event itu
    const trx = yield prisma_1.default.transaction.findFirst({
        where: {
            user_id: user.id,
            ticket_type_id: { in: ticketIds },
            status: "DONE",
        },
    });
    if (!trx) {
        throw {
            status: 403,
            message: "You can only review events you've attended",
        };
    }
    const review = yield prisma_1.default.review.create({
        data: {
            user_id: user.id,
            event_id,
            rating,
            comment,
        },
    });
    return review;
});
exports.createReviewService = createReviewService;
const getReviewsByEventService = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    // Ambil semua review berdasarkan event ID
    return prisma_1.default.review.findMany({
        where: { event_id: eventId },
        include: {
            // Sertakan nama user yang memberi review (tanpa seluruh data user)
            user: {
                select: { first_name: true, last_name: true },
            },
        },
    });
});
exports.getReviewsByEventService = getReviewsByEventService;
