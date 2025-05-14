import cron from "node-cron";
import prisma from "../../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { sendEmail } from "../nodemailer";

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

        // Kirim email notifikasi
        const to = trx.user.email;
        const subject = "Your Transaction Has Been Cancelled";
        const html = `
          <h3>Transaction Cancelled</h3>
          <p>Hi ${trx.user.first_name},</p>
          <p>Your transaction for the event <strong>${trx.ticket_type?.event.name}</strong> has been automatically cancelled because it was not confirmed within 3 days.</p>
          <p>If you're still interested, please create a new transaction.</p>
          <p>Thank you.</p>
        `;

        try {
          await sendEmail(to, subject, html);
          console.log(`[EMAIL] Notifikasi pembatalan terkirim ke ${to}`);
        } catch (emailErr) {
          console.error(`[EMAIL] Gagal mengirim email ke ${to}:`, emailErr);
        }

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
