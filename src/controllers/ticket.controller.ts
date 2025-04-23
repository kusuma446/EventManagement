import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";

export const createTicketType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role !== "ORGANIZER") {
      res.status(403).json({ message: "Only organizer can create ticket" });
      return;
    }

    const { event_id, name, price, quota } = req.body;
    const ticketType = await ticketService.createTicketType({
      event_id,
      name,
      price,
      quota,
    });

    res.status(201).json({ message: "Ticket type created", ticketType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
