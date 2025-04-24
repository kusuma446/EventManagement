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
