import { Request, Response, NextFunction } from "express";
import {
  createEventService,
  getAllEventsService,
  getEventDetailService,
} from "../services/event.service";

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createEventService(req);
    res.status(201).json({ message: "Event created", data });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAllEventsService(req);
    res.status(200).json({ events: data });
  } catch (error) {
    next(error);
  }
};

export const getEventDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getEventDetailService(req.params.id);
    res.status(200).json({ event: data });
  } catch (error) {
    next(error);
  }
};
