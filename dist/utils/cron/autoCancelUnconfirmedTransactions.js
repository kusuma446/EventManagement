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
exports.scheduleAutoCancelUnconfirmedTransactions = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
const scheduleAutoCancelUnconfirmedTransactions = () => {
    // Jalan setiap jam 1 pagi
    node_cron_1.default.schedule("0 1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[CRON] Auto-cancel transaksi belum dikonfirmasi dimulai...");
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        try {
            const transactions = yield prisma_1.default.transaction.findMany({
                where: {
                    status: client_1.TransactionStatus.WAITING_CONFIRMATION,
                    created_at: {
                        lte: threeDaysAgo,
                    },
                },
                include: {
                    user: true,
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
                    // Ubah status jadi CANCELED
                    yield tx.transaction.update({
                        where: { id: trx.id },
                        data: {
                            status: client_1.TransactionStatus.CANCELED,
                        },
                    });
                    // Restore kursi
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
                    // Restore poin
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
                console.log(`[CRON] Transaksi ${trx.id} → CANCELED (tidak dikonfirmasi dalam 3 hari).`);
            }
            console.log(`[CRON] Auto-cancel selesai. Total: ${transactions.length}`);
        }
        catch (err) {
            console.error("[CRON] Error saat auto-cancel transaksi:", err);
        }
    }));
};
exports.scheduleAutoCancelUnconfirmedTransactions = scheduleAutoCancelUnconfirmedTransactions;
