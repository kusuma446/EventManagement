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
exports.getOrganizerDashboardService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getOrganizerDashboardService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user.role !== "ORGANIZER") {
        throw { status: 403, message: "Only organizer can access this dashboard" };
    }
    const events = yield prisma_1.default.event.findMany({
        // Ambil semua event yang dibuat oleh user ini
        // Sertakan => semua jenis ticket, transaksi dalam tiap ticket, review terhadap event
        where: { organizer_id: user.id },
        include: {
            ticket_types: {
                include: { transactions: true },
            },
            reviews: true,
        },
    });
    // Ambil semua transaksi dengan status DONE
    // Hitung total harga transaksi yang sukses => totalSales
    return events.map((event) => {
        const totalSales = event.ticket_types.reduce((sum, ticket) => {
            const confirmed = ticket.transactions.filter((t) => t.status === "DONE");
            return sum + confirmed.reduce((acc, trx) => acc + trx.total_price, 0);
        }, 0);
        // Hitung jumlah tiket yang sudah terjual (berdasarkan transaksi dengan status DONE)
        const totalTicketSold = event.ticket_types.reduce((sum, ticket) => {
            return (sum + ticket.transactions.filter((t) => t.status === "DONE").length);
        }, 0);
        // Hitung rata-rata rating jika review ada
        // Jika belum ada review, beri null
        const avgRating = event.reviews.length
            ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
                event.reviews.length
            : null;
        return {
            event_id: event.id,
            event_name: event.name,
            totalSales,
            totalTicketSold,
            avgRating,
            reviewCount: event.reviews.length,
        };
    });
});
exports.getOrganizerDashboardService = getOrganizerDashboardService;
