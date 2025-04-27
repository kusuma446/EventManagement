import express from "express";
import { isAuthenticated, isOrganizer } from "../middlewares/auth.middleware";
import { createTicketType } from "../controllers/ticket.controller";
import ReqValidator from "../middlewares/validator.middleware";
import { createTicketSchema } from "../schemas/ticket.schema";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  ReqValidator(createTicketSchema),
  createTicketType
);

export default router;
