import { z } from "zod";

export const createTransactionSchema = z.object({
  ticket_type_id: z.string().min(1, "Ticket type ID is required"),
  voucher_id: z.string().optional(),
  coupon_id: z.string().optional(),
  used_points: z.number().int().min(0).optional(),
});
