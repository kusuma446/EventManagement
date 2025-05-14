import express from "express";
import {
  isAuthenticated,
  isCustomer,
  isOrganizer,
} from "../middlewares/auth.middleware";
import {
  createTransaction,
  getTransactionDetail,
  uploadPaymentProof,
  getOrganizerTransactions,
  approveTransaction,
  rejectTransaction,
} from "../controllers/transaction.controller";
import multer from "multer";
import ReqValidator from "../middlewares/validator.middleware";
import { createTransactionSchema } from "../schemas/transaction.schema";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get(
  "/organizer",
  isAuthenticated,
  isOrganizer,
  getOrganizerTransactions
);

router.post(
  "/",
  isAuthenticated,
  isCustomer,
  ReqValidator(createTransactionSchema),
  createTransaction
);

router.get("/:id", isAuthenticated, getTransactionDetail);

router.put(
  "/:id/upload-proof",
  isAuthenticated,
  upload.single("file"),
  isCustomer,
  uploadPaymentProof
);

router.put("/:id/approve", isAuthenticated, isOrganizer, approveTransaction);
router.put("/:id/reject", isAuthenticated, isOrganizer, rejectTransaction);

export default router;
