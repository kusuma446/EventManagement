import { z } from "zod";

export const createVoucherSchema = z.object({
  event_id: z.string().min(1, "Event ID is required"),
  code: z.string().min(1, "Code is required"),
  discount: z.number().int().min(1, "Discount must be greater than 0"),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
});
