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
exports.scheduleAutoExpireTransactions = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const scheduleAutoExpireTransactions = () => {
    node_cron_1.default.schedule("*/10 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[CRON] Auto-expire transaksi dimulai...");
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        try {
            const transactions = yield prisma_1.default.transaction.findMany({
                // Ambil transaksi yang WAITING_PAYMENT.
                where: {
                    status: client_1.TransactionStatus.WAITING_PAYMENT,
                    created_at: {
                        lte: twoHoursAgo, // berarti transaksi itu sudah lewat 2 jam sejak dibuat.
                    },
                },
                // Ambil data user yang melakukan transaksi.
                include: {
                    user: true,
                    // Ambil tipe tiket yang dipilih, dari ticket_type, ikut sertakan juga event terkait
                    ticket_type: {
                        include: {
                            event: true,
                        },
                    },
                    voucher: true,
                    coupon: true,
                },
            });
            for (const trx of transactions) {
                yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    // Update status transaksi
                    yield tx.transaction.update({
                        where: { id: trx.id },
                        data: {
                            status: client_1.TransactionStatus.EXPIRED,
                        },
                    });
                    // Restore available seats jika tiket ada dan punya event
                    if (trx.ticket_type) {
                        yield tx.ticketType.update({
                            where: { id: trx.ticket_type.id },
                            data: {
                                quota: {
                                    increment: 1,
                                },
                            },
                        });
                    }
                    // Kembalikan poin
                    if (trx.used_points > 0) {
                        yield tx.user.update({
                            where: { id: trx.user_id },
                            data: {
                                point: {
                                    increment: trx.used_points,
                                },
                            },
                        });
                    }
                    // Kembalikan kupon
                    if (trx.coupon_id) {
                        yield tx.coupon.update({
                            where: { id: trx.coupon_id },
                            data: {
                                used: false,
                            },
                        });
                    }
                }));
                console.log(`[CRON] Transaksi ${trx.id} → EXPIRED.`);
            }
            console.log(`[CRON] Auto-expire selesai. Total: ${transactions.length}`);
        }
        catch (err) {
            console.error("[CRON] Error:", err);
        }
    }));
};
exports.scheduleAutoExpireTransactions = scheduleAutoExpireTransactions;
