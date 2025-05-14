import express from "express";
import { createVoucher } from "../controllers/voucher.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isOrganizer } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/validator.middleware";
import { createVoucherSchema } from "../schemas/voucher.schema";
import { getVouchersWithEvent } from "../controllers/voucher.controller";
import { getVouchersByEventId } from "../controllers/voucher.controller";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  isOrganizer,
  ReqValidator(createVoucherSchema),
  createVoucher
);
router.get("/", isAuthenticated, isOrganizer, getVouchersWithEvent);
router.get("/by-event", isAuthenticated, isOrganizer, getVouchersByEventId);
export default router;
