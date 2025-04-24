import prisma from "../lib/prisma";
import { Request } from "express";

export const createTicketTypeService = async (req: Request) => {
  const user = req.user!;
  const { event_id, name, price, quota } = req.body;

  if (user.role !== "ORGANIZER") {
    throw { status: 403, message: "Only organizer can create tickets" };
  }

  const event = await prisma.event.findUnique({
    where: { id: event_id },
  });

  if (!event) {
    throw { status: 404, message: "Event not found" };
  }

  if (event.organizer_id !== user.id) {
    throw { status: 403, message: "You are not organizer of this event" };
  }

  const ticketType = await prisma.ticketType.create({
    data: {
      event_id,
      name,
      price,
      quota,
    },
  });

  return ticketType;
};
