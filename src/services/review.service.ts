import prisma from "../lib/prisma";
import { Request } from "express";

export const createReviewService = async (req: Request) => {
  const user = req.user!;
  const { event_id, rating, comment } = req.body;

  if (user.role !== "CUSTOMER") {
    throw { status: 403, message: "Only customers can submit reviews" };
  }

  // Ambil semua ticketType yang terkait dengan event
  const tickets = await prisma.ticketType.findMany({
    where: { event_id },
    select: { id: true },
  });

  const ticketIds = tickets.map((t) => t.id);

  // Cari transaksi DONE milik user untuk event ini
  const trx = await prisma.transaction.findFirst({
    where: {
      user_id: user.id,
      ticket_type_id: { in: ticketIds },
      status: "DONE",
    },
  });

  if (!trx) {
    throw {
      status: 403,
      message: "You can only review events you've attended",
    };
  }

  // Cek apakah sudah pernah review transaksi ini
  const existing = await prisma.review.findFirst({
    where: { transaction_id: trx.id },
  });

  if (existing) {
    throw { status: 400, message: "You have already submitted a review" };
  }

  // Buat review baru
  const review = await prisma.review.create({
    data: {
      user_id: user.id,
      event_id,
      rating,
      comment,
      transaction_id: trx.id, // penting!
    },
  });

  return review;
};

export const getReviewsByEventService = async (req: Request) => {
  // Ambil semua review berdasarkan event ID
  const { event_id } = req.params;

  const reviews = await prisma.review.findMany({
    where: { event_id },
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return reviews;
};
