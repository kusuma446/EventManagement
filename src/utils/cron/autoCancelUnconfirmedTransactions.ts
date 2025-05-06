import cron from "node-cron";
import prisma from "../../lib/prisma";
import { TransactionStatus } from "@prisma/client";

export const scheduleAutoCancelUnconfirmedTransactions = () => {
  // Jalan setiap jam 1 pagi
  cron.schedule("0 1 * * *", async () => {
    console.log("[CRON] Auto-cancel transaksi belum dikonfirmasi dimulai...");

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          status: TransactionStatus.WAITING_CONFIRMATION,
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
        await prisma.$transaction(async (tx) => {
          // Ubah status jadi CANCELED
          await tx.transaction.update({
            where: { id: trx.id },
            data: {
              status: TransactionStatus.CANCELED,
            },
          });

          // Restore kursi
          if (trx.ticket_type) {
            await tx.ticketType.update({
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
            await tx.user.update({
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
            await tx.coupon.update({
              where: { id: trx.coupon_id },
              data: {
                used: false,
              },
            });
          }
        });

        console.log(
          `[CRON] Transaksi ${trx.id} → CANCELED (tidak dikonfirmasi dalam 3 hari).`
        );
      }

      console.log(`[CRON] Auto-cancel selesai. Total: ${transactions.length}`);
    } catch (err) {
      console.error("[CRON] Error saat auto-cancel transaksi:", err);
    }
  });
};
