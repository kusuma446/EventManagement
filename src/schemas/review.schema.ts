import { z } from "zod";

export const createReviewSchema = z.object({
  event_id: z.string().min(1, "Event ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().or(z.literal("")),
});
