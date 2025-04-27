import cron from "node-cron";
import prisma from "../../lib/prisma";

export const scheduleCleanupExpiredPointsAndCoupons = () => {
  // Jalankan setiap hari jam 3 pagi
  cron.schedule("0 3 * * *", async () => {
    console.log("[CRON] Pembersihan poin & kupon yang kedaluwarsa dimulai...");

    const now = new Date();

    try {
      // 1. Hapus poin dari PointHistory yang sudah expired
      const expiredPoints = await prisma.pointHistory.findMany({
        where: {
          expires_at: {
            lte: now,
          },
        },
      });

      for (const point of expiredPoints) {
        // Kurangi saldo poin user sesuai jumlah poin yang expired
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: point.user_id },
            data: {
              point: {
                decrement: point.amount,
              },
            },
          });

          await tx.pointHistory.delete({
            where: { id: point.id },
          });
        });

        console.log(
          `[CRON] Poin expired milik user ${point.user_id} sebesar ${point.amount} telah dibersihkan.`
        );
      }

      // 2. Update status kupon yang sudah melewati end_date
      const expiredCoupons = await prisma.coupon.updateMany({
        where: {
          end_date: {
            lte: now,
          },
        },
        data: {
          used: true, // anggap 'used = true' berarti kupon tidak bisa dipakai lagi
        },
      });

      console.log(
        `[CRON] Poin expired: ${expiredPoints.length}, kupon expired: ${expiredCoupons.count}`
      );
    } catch (error) {
      console.error("[CRON] Error saat membersihkan poin/kupon:", error);
    }
  });
};
