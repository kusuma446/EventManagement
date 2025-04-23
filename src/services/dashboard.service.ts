import prisma from "../lib/prisma";

export const getEventsByOrganizer = async (organizer_id: string) => {
  return prisma.event.findMany({
    where: { organizer_id },
    include: {
      ticket_types: {
        include: { transactions: true },
      },
      reviews: true,
    },
  });
};
