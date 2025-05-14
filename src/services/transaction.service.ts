import prisma from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { Request } from "express";
import path from "path";
import { sendEmail } from "../utils/nodemailer";

export const createTransactionService = async (req: Request) => {
  const user = req.user!;
  const { ticket_type_id, voucher_id, coupon_id, used_points } = req.body;

  console.log("📦 Body diterima:", req.body);
  console.log("👤 User login:", user);

  if (user.role !== "CUSTOMER") {
    throw { status: 403, message: "Only customers can make transactions" };
  }

  if (!ticket_type_id) {
    throw { status: 400, message: "ticket_type_id is required" };
  }

  const ticket = await prisma.ticketType.findUnique({
    where: { id: ticket_type_id },
  });

  if (!ticket || ticket.quota <= 0) {
    throw { status: 400, message: "Ticket not available" };
  }

  // --- Voucher ---
  let voucherDiscount = 0;
  if (voucher_id) {
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

  // --- Coupon ---
  let couponDiscount = 0;
  if (coupon_id) {
    const coupon = await prisma.coupon.findUnique({ where: { id: coupon_id } });
    if (!coupon || coupon.used) {
      throw { status: 404, message: "Coupon not found or already used" };
    }

    couponDiscount = coupon.discount;
  }

  const pointsUsed = used_points || 0;

  // --- Cek transaksi ganda ---
  const existing = await prisma.transaction.findFirst({
    where: { user_id: user.id, ticket_type_id },
  });
  if (existing) {
    throw { status: 400, message: "You already purchased this ticket" };
  }

  // --- Hitung total ---
  let total_price =
    ticket.price - voucherDiscount - couponDiscount - pointsUsed;
  if (total_price < 0) total_price = 0;

  // --- Buat transaksi ---
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

  // --- Kurangi kuota ---
  await prisma.ticketType.update({
    where: { id: ticket_type_id },
    data: { quota: { decrement: 1 } },
  });

  // --- Tandai kupon digunakan ---
  if (coupon_id) {
    await prisma.coupon.update({
      where: { id: coupon_id },
      data: { used: true },
    });
  }

  // --- Kurangi poin user ---
  if (pointsUsed > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { point: { decrement: pointsUsed } },
    });
  }

  return transaction;
};

export const getTransactionDetailService = async (id: string) => {
  const trx = await prisma.transaction.findUnique({
    where: { id },
    include: {
      ticket_type: {
        include: {
          event: {
            select: {
              name: true,
              image: true,
              location: true,
              start_date: true,
              end_date: true,
            },
          },
        },
      },
    },
  });

  if (!trx) throw { status: 404, message: "Transaction not found" };
  return trx;
};

export const uploadPaymentProofService = async (req: Request) => {
  const { id } = req.params;
  const user = req.user!;

  if (!req.file) throw { status: 400, message: "File is required" };
  const filePath = `/uploads/${req.file.filename}`;

  // Validasi transaksi
  const trx = await prisma.transaction.findUnique({ where: { id } });
  if (!trx) throw { status: 404, message: "Transaction not found" };
  if (trx.user_id !== user.id) throw { status: 403, message: "Unauthorized" };

  // Update bukti dan status transaksi
  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      payment_proof: filePath,
      status: TransactionStatus.WAITING_CONFIRMATION,
    },
  });

  return updated;
};

// my-ticket
export const getMyTicketsService = async (req: Request) => {
  const user = req.user;
  if (!user) throw { status: 401, message: "Unauthorized" };

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: user.id,
      status: {
        in: ["WAITING_PAYMENT", "WAITING_CONFIRMATION", "DONE"],
      },
    },
    include: {
      ticket_type: {
        include: {
          event: {
            select: {
              id: true,
              name: true,
              image: true,
              location: true,
              end_date: true,
            },
          },
        },
      },
      review: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return transactions;
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
    select: {
      id: true,
      total_price: true,
      status: true,
      payment_proof: true,
      user: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      ticket_type: {
        select: {
          name: true,
          event: {
            select: {
              name: true,
            },
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
