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
exports.scheduleCleanupExpiredPointsAndCoupons = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const scheduleCleanupExpiredPointsAndCoupons = () => {
    // Jalankan setiap hari jam 3 pagi
    node_cron_1.default.schedule("0 3 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[CRON] Pembersihan poin & kupon yang kedaluwarsa dimulai...");
        const now = new Date();
        try {
            // 1. Hapus poin dari PointHistory yang sudah expired
            const expiredPoints = yield prisma_1.default.pointHistory.findMany({
                where: {
                    expires_at: {
                        lte: now,
                    },
                },
            });
            for (const point of expiredPoints) {
                // Kurangi saldo poin user sesuai jumlah poin yang expired
                yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    yield tx.user.update({
                        where: { id: point.user_id },
                        data: {
                            point: {
                                decrement: point.amount,
                            },
                        },
                    });
                    yield tx.pointHistory.delete({
                        where: { id: point.id },
                    });
                }));
                console.log(`[CRON] Poin expired milik user ${point.user_id} sebesar ${point.amount} telah dibersihkan.`);
            }
            // 2. Update status kupon yang sudah melewati end_date
            const expiredCoupons = yield prisma_1.default.coupon.updateMany({
                where: {
                    end_date: {
                        lte: now,
                    },
                },
                data: {
                    used: true, // anggap 'used = true' berarti kupon tidak bisa dipakai lagi
                },
            });
            console.log(`[CRON] Poin expired: ${expiredPoints.length}, kupon expired: ${expiredCoupons.count}`);
        }
        catch (error) {
            console.error("[CRON] Error saat membersihkan poin/kupon:", error);
        }
    }));
};
exports.scheduleCleanupExpiredPointsAndCoupons = scheduleCleanupExpiredPointsAndCoupons;
