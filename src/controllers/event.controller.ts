import { Request, Response, NextFunction } from "express";
import {
  createEventService,
  getAllEventsService,
  getEventDetailService,
  getMyEventsService,
  updateEventService,
  ShowEventsService,
} from "../services/event.service";
import * as eventService from "../services/event.service";

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
    console.log("🔍 Organizer payload:", req.user);
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

// get event untuk ORGANIZER
export const getMyEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getMyEventsService(req);
    res.status(200).json({ message: "My events retrieved successfully", data });
  } catch (error) {
    next(error);
  }
};

export const searchEvents = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    const events = await eventService.findEventsByTitle(query);
    res.json(events);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await updateEventService(req);
    res.status(200).json({ message: "Event updated successfully", data });
  } catch (error) {
    next(error);
  }
};

// Showing the event to the customer
export const SHowEventsController = async (req: Request, res: Response) => {
  try {
    const events = await ShowEventsService(req);
    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ success: false, message });
  }
};
