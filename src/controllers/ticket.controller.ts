import { Request, Response, NextFunction } from "express";
import {
  createTicketTypeService,
  getTicketTypesService,
} from "../services/ticket.service";

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

export const getTicketTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getTicketTypesService(req);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
