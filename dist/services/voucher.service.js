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
exports.createVoucherService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createVoucherService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { event_id, code, discount, start_date, end_date } = req.body;
    // Cek apakah user "ORGANIZER"
    if (user.role !== "ORGANIZER") {
        throw { status: 403, message: "Only organizers can create vouchers" };
    }
    // Mencari event dari Organizer
    const event = yield prisma_1.default.event.findUnique({ where: { id: event_id } });
    if (!event)
        throw { status: 404, message: "Event not found" };
    if (event.organizer_id !== user.id) {
        throw { status: 403, message: "You are not the organizer of this event" };
    }
    // Buat voucher
    const voucher = yield prisma_1.default.voucher.create({
        data: {
            event_id,
            code,
            discount,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
        },
    });
    return voucher;
});
exports.createVoucherService = createVoucherService;
