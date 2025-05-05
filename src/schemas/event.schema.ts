import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  Pay: z.boolean(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  available_seats: z.number().int().min(1, "At least one seat is required"),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    event_name: z.string().min(1),
    date: z.string().min(1), // bisa disesuaikan dengan ISO format
    location: z.string().min(1),
  }),
});
