import prisma from "../lib/prisma";

export const createEvent = (data: any) => {
  return prisma.event.create({ data });
};

export const getAllEvents = (category?: string) => {
  return prisma.event.findMany({
    where: category
      ? { category: { equals: category, mode: "insensitive" } }
      : undefined,
    include: {
      ticket_types: true,
      reviews: true,
    },
  });
};

export const getEventDetail = (id: string) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      ticket_types: true,
      reviews: {
        include: {
          user: {
            select: { first_name: true, last_name: true },
          },
        },
      },
      organizer: {
        select: { first_name: true, last_name: true, email: true },
      },
    },
  });
};
