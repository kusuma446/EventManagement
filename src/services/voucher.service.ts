import prisma from "../lib/prisma";
import { Request } from "express";

export const createVoucherService = async (req: Request) => {
  const user = req.user!;
  const { event_id, code, discount, start_date, end_date } = req.body;

  // Cek apakah user "ORGANIZER"
  if (user.role !== "ORGANIZER") {
    throw { status: 403, message: "Only organizers can create vouchers" };
  }

  // Mencari event dari Organizer
  const event = await prisma.event.findUnique({ where: { id: event_id } });
  if (!event) throw { status: 404, message: "Event not found" };
  if (event.organizer_id !== user.id) {
    throw { status: 403, message: "You are not the organizer of this event" };
  }

  // Buat voucher
  const voucher = await prisma.voucher.create({
    data: {
      event_id,
      code,
      discount,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    },
  });

  return voucher;
};

export const getVouchersWithEventService = async (req: Request) => {
  const userId = req.user!.id;

  const vouchers = await prisma.voucher.findMany({
    where: {
      event: {
        organizer_id: userId,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          location: true,
          start_date: true,
          end_date: true,
        },
      },
    },
    orderBy: {
      start_date: "desc",
    },
  });

  return vouchers;
};

export const getVouchersByEventIdService = async (
  eventId: string,
  req: Request
) => {
  const userId = req.user!.id;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizer_id: userId,
    },
  });

  if (!event) {
    throw new Error("Event not found or access denied");
  }

  const vouchers = await prisma.voucher.findMany({
    where: { event_id: eventId },
    orderBy: {
      start_date: "desc",
    },
  });

  return vouchers;
};
