import prisma from "../lib/prisma";

export const createTicketType = (data: any) => {
  return prisma.ticketType.create({ data });
};
