import prisma from "../../lib/prisma";
import cron from "node-cron";
import { TransactionStatus } from "@prisma/client";
import { sendEmail } from "../nodemailer";

export const scheduleAutoExpireTransactions = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("[CRON] Auto-expire transaksi dimulai...");

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    try {
      const transactions = await prisma.transaction.findMany({
        // Ambil transaksi yang WAITING_PAYMENT.
        where: {
          status: TransactionStatus.WAITING_PAYMENT,
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
        await prisma.$transaction(async (tx) => {
          // Update status transaksi
          await tx.transaction.update({
            where: { id: trx.id },
            data: {
              status: TransactionStatus.EXPIRED,
            },
          });

          // Restore available seats jika tiket ada dan punya event
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

          // Kembalikan poin
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

        console.log(`[CRON] Transaksi ${trx.id} → EXPIRED.`);

        // Kirim email pemberitahuan kepada pengguna
        const to = trx.user.email;
        const subject = "Your Transaction Has Expired";
        const html = `
          <h3>Transaction Expired</h3>
          <p>Hi ${trx.user.first_name},</p>
          <p>Your transaction for the event <strong>${trx.ticket_type?.event.name}</strong> has expired because it was not paid within 2 hours.</p>
          <p>Please feel free to create a new transaction if you're still interested in the event.</p>
          <p>Thank you.</p>
        `;

        try {
          await sendEmail(to, subject, html);
          console.log(
            `[CRON] Email sent to ${trx.user.email} about expired transaction.`
          );
        } catch (emailError) {
          console.error(
            `[CRON] Failed to send email to ${trx.user.email}:`,
            emailError
          );
        }
      }

      console.log(`[CRON] Auto-expire selesai. Total: ${transactions.length}`);
    } catch (err) {
      console.error("[CRON] Error:", err);
    }
  });
};
