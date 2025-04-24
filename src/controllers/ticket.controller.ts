import { Request, Response, NextFunction } from "express";
import { createTicketTypeService } from "../services/ticket.service";

export const createTicketType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createTicketTypeService(req);
    res.status(201).json({ message: "Ticket type created", data });
  } catch (error) {
    next(error);
  }
};
