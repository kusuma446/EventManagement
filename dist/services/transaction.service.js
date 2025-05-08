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
exports.autoCancelExpiredTransactionsService = exports.rejectTransactionService = exports.approveTransactionService = exports.getOrganizerTransactionsService = exports.uploadPaymentProofService = exports.createTransactionService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const nodemailer_1 = require("../utils/nodemailer");
const createTransactionService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Transaksi hanya CUSTOMER
    if (user.role !== "CUSTOMER") {
        throw { status: 403, message: "Only customers can make transactions" };
    }
    const { ticket_type_id, voucher_id, coupon_id, used_points } = req.body;
    if (!ticket_type_id)
        throw { status: 400, message: "ticket_type_id is required" };
    const ticket = yield prisma_1.default.ticketType.findUnique({
        where: { id: ticket_type_id },
    });
    // Cek ketersediaan tiket
    if (!ticket || ticket.quota <= 0)
        throw { status: 400, message: "Ticket not available" };
    let voucherDiscount = 0;
    // Mengecek apakah request body menyertakan voucher_id
    if (voucher_id) {
        // Mencari voucher di database berdasarkan ID
        const voucher = yield prisma_1.default.voucher.findUnique({
            where: { id: voucher_id },
        });
        if (!voucher)
            throw { status: 404, message: "Voucher not found" };
        const now = new Date();
        if (voucher.start_date > now || voucher.end_date < now) {
            throw { status: 400, message: "Voucher is not valid at this time" };
        }
        voucherDiscount = voucher.discount;
    }
    let couponDiscount = 0;
    // Validasi coupon jika ada
    if (coupon_id) {
        const coupon = yield prisma_1.default.coupon.findUnique({ where: { id: coupon_id } });
        if (!coupon || coupon.used)
            throw { status: 404, message: "Coupon not found or already used" };
        couponDiscount = coupon.discount;
    }
    const pointsUsed = used_points || 0;
    // Cek apakah user sudah pernah beli tiket ini
    const existing = yield prisma_1.default.transaction.findFirst({
        where: { user_id: user.id, ticket_type_id },
    });
    if (existing)
        throw { status: 400, message: "You already purchased this ticket" };
    // Hitung total price
    let total_price = ticket.price - voucherDiscount - couponDiscount - pointsUsed;
    if (total_price < 0)
        total_price = 0; // Tidak boleh minus
    // Buat transaksi
    const transaction = yield prisma_1.default.transaction.create({
        data: {
            user_id: user.id,
            ticket_type_id,
            total_price,
            status: client_1.TransactionStatus.WAITING_PAYMENT,
            used_points: pointsUsed,
            voucher_id,
            coupon_id,
        },
    });
    // Kurangi kuota tiket
    yield prisma_1.default.ticketType.update({
        where: { id: ticket_type_id },
        data: { quota: { decrement: 1 } },
    });
    // Tandai kupon kalau digunakan
    if (coupon_id) {
        yield prisma_1.default.coupon.update({
            where: { id: coupon_id },
            data: { used: true },
        });
    }
    // Kurangi point jika digunakan
    if (used_points) {
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: { point: { decrement: used_points } },
        });
    }
    return transaction;
});
exports.createTransactionService = createTransactionService;
const uploadPaymentProofService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        throw { status: 400, message: "File is required" };
    const filePath = path_1.default.join("uploads", req.file.filename);
    return { path: filePath };
});
exports.uploadPaymentProofService = uploadPaymentProofService;
const getOrganizerTransactionsService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const transactions = yield prisma_1.default.transaction.findMany({
        where: {
            ticket_type: {
                event: {
                    organizer_id: user.id,
                },
            },
        },
        include: {
            user: {
                select: { first_name: true, last_name: true },
            },
            ticket_type: {
                select: {
                    name: true,
                    event: {
                        select: { name: true },
                    },
                },
            },
        },
    });
    return transactions;
});
exports.getOrganizerTransactionsService = getOrganizerTransactionsService;
const approveTransactionService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const { id } = req.params;
    // Ambil detail transaksi
    const trx = yield prisma_1.default.transaction.findUnique({
        // Ambil relasi ke tickey_type, dan dari situ juga ambil relasi ke event
        where: { id },
        include: {
            ticket_type: { include: { event: true } },
            user: true,
        },
    });
    if (!trx)
        throw { status: 404, message: "Transaction not found" };
    // Cek apakah user yang login adalah organizer dari event itu
    if (((_a = trx.ticket_type) === null || _a === void 0 ? void 0 : _a.event.organizer_id) !== user.id) {
        throw { status: 403, message: "You are not the organizer of this event" };
    }
    const updated = yield prisma_1.default.transaction.update({
        where: { id },
        data: { status: client_1.TransactionStatus.DONE },
    });
    // Kirim email notifikasi ke customer
    if (trx.user && trx.user.email) {
        yield (0, nodemailer_1.sendEmail)(trx.user.email, "Your Transaction Has Been Approved!", `<p>Hi ${trx.user.first_name},</p>
       <p>Your transaction for event ticket has been <strong>approved</strong> successfully.</p>
       <p>Thank you for using our platform!</p>`);
    }
    return updated;
});
exports.approveTransactionService = approveTransactionService;
const rejectTransactionService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const { id } = req.params;
    const trx = yield prisma_1.default.transaction.findUnique({
        where: { id },
        include: {
            ticket_type: { include: { event: true } },
            user: true,
        },
    });
    if (!trx)
        throw { status: 404, message: "Transaction not found" };
    if (((_a = trx.ticket_type) === null || _a === void 0 ? void 0 : _a.event.organizer_id) !== user.id) {
        throw { status: 403, message: "You are not the organizer of this event" };
    }
    // Kebalikan kuota ticket
    if (trx.ticket_type_id) {
        yield prisma_1.default.ticketType.update({
            where: { id: trx.ticket_type_id },
            data: { quota: { increment: 1 } },
        });
    }
    // Unmark kupon
    if (trx.coupon_id) {
        yield prisma_1.default.coupon.update({
            where: { id: trx.coupon_id },
            data: { used: false },
        });
    }
    // Kembalikan point
    if (trx.used_points > 0) {
        yield prisma_1.default.user.update({
            where: { id: trx.user_id },
            data: { point: { increment: trx.used_points } },
        });
    }
    // Update status transaksi
    const updated = yield prisma_1.default.transaction.update({
        where: { id },
        data: { status: client_1.TransactionStatus.REJECTED },
    });
    // Kirim email notifikasi ke customer
    if (trx.user && trx.user.email) {
        yield (0, nodemailer_1.sendEmail)(trx.user.email, "Your Transaction Has Been Rejected", `<p>Hi ${trx.user.first_name},</p>
       <p>Unfortunately, your transaction for event ticket has been <strong>rejected</strong> by the event organizer.</p>
       <p>Please check the event or try again later.</p>`);
    }
    return updated;
});
exports.rejectTransactionService = rejectTransactionService;
const autoCancelExpiredTransactionsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    // Ambil semua transaksi expired + ambil user
    const expired = yield prisma_1.default.transaction.findMany({
        where: {
            status: client_1.TransactionStatus.WAITING_PAYMENT,
            created_at: { lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        },
        include: { user: true }, // Ambil relasi user
    });
    // Ubah status transaksi menjadi EXPIRED
    for (const trx of expired) {
        yield prisma_1.default.transaction.update({
            where: { id: trx.id },
            data: { status: client_1.TransactionStatus.EXPIRED },
        });
        if (trx.ticket_type_id) {
            yield prisma_1.default.ticketType.update({
                where: { id: trx.ticket_type_id },
                data: { quota: { increment: 1 } },
            });
        }
        if (trx.coupon_id) {
            yield prisma_1.default.coupon.update({
                where: { id: trx.coupon_id },
                data: { used: false },
            });
        }
        if (trx.used_points > 0) {
            yield prisma_1.default.user.update({
                where: { id: trx.user_id },
                data: { point: { increment: trx.used_points } },
            });
        }
        // Kirim notifikasi email ke user
        if (trx.user && trx.user.email) {
            yield (0, nodemailer_1.sendEmail)(trx.user.email, "Your Transaction Has Been Auto-Canceled", `<p>Hi ${trx.user.first_name},</p>
         <p>Unfortunately, your transaction was <strong>auto-canceled</strong> because the payment time limit has expired.</p>
         <p>Please create a new transaction if you still want to attend the event.</p>`);
        }
    }
    return expired;
});
exports.autoCancelExpiredTransactionsService = autoCancelExpiredTransactionsService;
