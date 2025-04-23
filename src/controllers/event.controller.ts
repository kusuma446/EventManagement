import { Request, Response } from "express";
import * as eventService from "../services/event.service";

export const listEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.query;

    const events = await eventService.getAllEvents(category as string);

    res.status(200).json({ events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    if (user.role !== "ORGANIZER") {
      res.status(403).json({ message: "Only organizer can create event" });
      return;
    }

    const {
      name,
      description,
      category,
      location,
      Pay,
      start_date,
      end_date,
      available_seats,
    } = req.body;

    const newEvent = await eventService.createEvent({
      name,
      description,
      category,
      location,
      Pay,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      available_seats,
      organizer_id: user.id,
    });

    res.status(201).json({ message: "Event created", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const getEventDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await eventService.getEventDetail(id);

    if (!event) {
      res.status(404).json({ message: "Event no found" });
      return;
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
