import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  Pay: z
    .union([z.string(), z.boolean()])
    .transform((val) => val === "true" || val === true)
    .refine((val) => typeof val === "boolean", {
      message: "Pay must be a boolean",
    }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  available_seats: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Available seats must be a positive integer",
    }),
});

export const updateEventSchema = z.object({
  name: z.string().min(1),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }), // bisa disesuaikan dengan ISO format
  location: z.string().min(1),
});
