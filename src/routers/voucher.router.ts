import express from "express";
import { createVoucher } from "../controllers/voucher.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOrganizer } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", isAuthenticated, isOrganizer, createVoucher);

export default router;
