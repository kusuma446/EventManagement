import prisma from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { Request } from "express";
import path from "path";
import { sendEmail } from "../utils/nodemailer";

export const createTransactionService = async (req: Request) => {
  const user = req.user!;
  // Transaksi hanya CUSTOMER
  if (user.role !== "CUSTOMER") {
    throw { status: 403, message: "Only customers can make transactions" };
  }
  const { ticket_type_id, voucher_id, coupon_id, used_points } = req.body;

  if (!ticket_type_id)
    throw { status: 400, message: "ticket_type_id is required" };

  const ticket = await prisma.ticketType.findUnique({
    where: { id: ticket_type_id },
  });

  // Cek ketersediaan tiket
  if (!ticket || ticket.quota <= 0)
    throw { status: 400, message: "Ticket not available" };

  let voucherDiscount = 0;
  // Mengecek apakah request body menyertakan voucher_id
  if (voucher_id) {
    // Mencari voucher di database berdasarkan ID
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucher_id },
    });
    if (!voucher) throw { status: 404, message: "Voucher not found" };

    const now = new Date();
    if (voucher.start_date > now || voucher.end_date < now) {
      throw { status: 400, message: "Voucher is not valid at this time" };
    }

    voucherDiscount = voucher.discount;
  }

  let couponDiscount = 0;
  // Validasi coupon jika ada
  if (coupon_id) {
    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (!coupon || coupon.used)
      throw { status: 404, message: "Coupon not found or already used" };
    couponDiscount = coupon.discount;
  }

  const pointsUsed = used_points || 0;

  // Cek apakah user sudah pernah beli tiket ini
  const existing = await prisma.transaction.findFirst({
    where: { user_id: user.id, ticket_type_id },
  });
  if (existing)
    throw { status: 400, message: "You already purchased this ticket" };

  // Hitung total price
  let total_price =
    ticket.price - voucherDiscount - couponDiscount - pointsUsed;
  if (total_price < 0) total_price = 0; // Tidak boleh minus

  // Buat transaksi
  const transaction = await prisma.transaction.create({
    data: {
      user_id: user.id,
      ticket_type_id,
      total_price,
      status: TransactionStatus.WAITING_PAYMENT,
      used_points: pointsUsed,
      voucher_id,
      coupon_id,
    },
  });

  // Kurangi kuota tiket
  await prisma.ticketType.update({
    where: { id: ticket_type_id },
    data: { quota: { decrement: 1 } },
  });

  // Tandai kupon kalau digunakan
  if (coupon_id) {
    await prisma.coupon.update({
      where: { id: coupon_id },
      data: { used: true },
    });
  }

  // Kurangi point jika digunakan
  if (used_points) {
    await prisma.user.update({
      where: { id: user.id },
      data: { point: { decrement: used_points } },
    });
  }

  return transaction;
};

export const uploadPaymentProofService = async (req: Request) => {
  if (!req.file) throw { status: 400, message: "File is required" };
  const filePath = path.join("uploads", req.file.filename);
  return { path: filePath };
};

export const getOrganizerTransactionsService = async (req: Request) => {
  const user = req.user!;

  const transactions = await prisma.transaction.findMany({
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
};

export const approveTransactionService = async (req: Request) => {
  const user = req.user!;
  const { id } = req.params;

  // Ambil detail transaksi
  const trx = await prisma.transaction.findUnique({
    // Ambil relasi ke tickey_type, dan dari situ juga ambil relasi ke event
    where: { id },
    include: {
      ticket_type: { include: { event: true } },
      user: true,
    },
  });
  if (!trx) throw { status: 404, message: "Transaction not found" };
  // Cek apakah user yang login adalah organizer dari event itu
  if (trx.ticket_type?.event.organizer_id !== user.id) {
    throw { status: 403, message: "You are not the organizer of this event" };
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: { status: TransactionStatus.DONE },
  });

  // Kirim email notifikasi ke customer
  if (trx.user && trx.user.email) {
    await sendEmail(
      trx.user.email,
      "Your Transaction Has Been Approved!",
      `<p>Hi ${trx.user.first_name},</p>
       <p>Your transaction for event ticket has been <strong>approved</strong> successfully.</p>
       <p>Thank you for using our platform!</p>`
    );
  }

  return updated;
};

export const rejectTransactionService = async (req: Request) => {
  const user = req.user!;
  const { id } = req.params;

  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      ticket_type: { include: { event: true } },
      user: true,
    },
  });
  if (!trx) throw { status: 404, message: "Transaction not found" };

  if (trx.ticket_type?.event.organizer_id !== user.id) {
    throw { status: 403, message: "You are not the organizer of this event" };
  }

  // Kebalikan kuota ticket
  if (trx.ticket_type_id) {
    await prisma.ticketType.update({
      where: { id: trx.ticket_type_id },
      data: { quota: { increment: 1 } },
    });
  }

  // Unmark kupon
  if (trx.coupon_id) {
    await prisma.coupon.update({
      where: { id: trx.coupon_id },
      data: { used: false },
    });
  }

  // Kembalikan point
  if (trx.used_points > 0) {
    await prisma.user.update({
      where: { id: trx.user_id },
      data: { point: { increment: trx.used_points } },
    });
  }

  // Update status transaksi
  const updated = await prisma.transaction.update({
    where: { id },
    data: { status: TransactionStatus.REJECTED },
  });

  // Kirim email notifikasi ke customer
  if (trx.user && trx.user.email) {
    await sendEmail(
      trx.user.email,
      "Your Transaction Has Been Rejected",
      `<p>Hi ${trx.user.first_name},</p>
       <p>Unfortunately, your transaction for event ticket has been <strong>rejected</strong> by the event organizer.</p>
       <p>Please check the event or try again later.</p>`
    );
  }

  return updated;
};

export const autoCancelExpiredTransactionsService = async () => {
  const now = new Date();

  // Ambil semua transaksi expired + ambil user
  const expired = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      created_at: { lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    },
    include: { user: true }, // Ambil relasi user
  });

  // Ubah status transaksi menjadi EXPIRED
  for (const trx of expired) {
    await prisma.transaction.update({
      where: { id: trx.id },
      data: { status: TransactionStatus.EXPIRED },
    });

    if (trx.ticket_type_id) {
      await prisma.ticketType.update({
        where: { id: trx.ticket_type_id },
        data: { quota: { increment: 1 } },
      });
    }

    if (trx.coupon_id) {
      await prisma.coupon.update({
        where: { id: trx.coupon_id },
        data: { used: false },
      });
    }

    if (trx.used_points > 0) {
      await prisma.user.update({
        where: { id: trx.user_id },
        data: { point: { increment: trx.used_points } },
      });
    }

    // Kirim notifikasi email ke user
    if (trx.user && trx.user.email) {
      await sendEmail(
        trx.user.email,
        "Your Transaction Has Been Auto-Canceled",
        `<p>Hi ${trx.user.first_name},</p>
         <p>Unfortunately, your transaction was <strong>auto-canceled</strong> because the payment time limit has expired.</p>
         <p>Please create a new transaction if you still want to attend the event.</p>`
      );
    }
  }

  return expired;
};
