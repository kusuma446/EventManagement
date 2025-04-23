import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { createTicketType } from "../controllers/ticket.controller";

const router = express.Router();

router.post("/", isAuthenticated, createTicketType);

export default router;
