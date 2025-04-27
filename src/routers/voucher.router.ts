import express from "express";
import { createVoucher } from "../controllers/voucher.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOrganizer } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/validator.middleware";
import { createVoucherSchema } from "../schemas/voucher.schema";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  ReqValidator(createVoucherSchema),
  createVoucher
);

export default router;
