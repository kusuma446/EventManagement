import { z } from "zod";

export const createTicketSchema = z.object({
  event_id: z.string().min(1, "Event ID is required"),
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quota: z.number().int().min(1, "Quota must be at least 1"),
});
