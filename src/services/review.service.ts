import prisma from "../lib/prisma";

export const createReview = (data: any) => {
  return prisma.review.create({ data });
};

export const getReviewsByEvent = (eventId: string) => {
  return prisma.review.findMany({
    where: { event_id: eventId },
    include: {
      user: {
        select: { first_name: true, last_name: true },
      },
    },
  });
};

export const hasUserPurchased = async (user_id: string, event_id: string) => {
  const tickets = await prisma.ticketType.findMany({
    where: { event_id },
    select: { id: true },
  });

  const ticketIds = tickets.map((t) => t.id);

  const trx = await prisma.transaction.findFirst({
    where: {
      user_id,
      ticket_type_id: { in: ticketIds },
      status: "DONE",
    },
  });

  return !!trx;
};
