import prisma from "../lib/prisma";
import { Request } from "express";

export const createReviewService = async (req: Request) => {
  const user = req.user!;
  const { event_id, rating, comment } = req.body;

  // Ambil semua ticketType.id yang terkait dengan event tersebut
  const tickets = await prisma.ticketType.findMany({
    where: { event_id },
    select: { id: true },
  });
  const ticketIds = tickets.map((t) => t.id);

  // Cek apakah user punya transaksi dengan status DONE terhadap salah satu ticket type dari event itu
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

  const review = await prisma.review.create({
    data: {
      user_id: user.id,
      event_id,
      rating,
      comment,
    },
  });

  return review;
};

export const getReviewsByEventService = async (eventId: string) => {
  // Ambil semua review berdasarkan event ID
  return prisma.review.findMany({
    where: { event_id: eventId },
    include: {
      // Sertakan nama user yang memberi review (tanpa seluruh data user)
      user: {
        select: { first_name: true, last_name: true },
      },
    },
  });
};
