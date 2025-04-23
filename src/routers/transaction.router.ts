import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware";
import {
  createTransaction,
  uploadPaymentProof,
  approveTransaction,
  rejectTransaction,
} from "../controllers/transaction.controller";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", isAuthenticated, createTransaction);
router.put(
  "/:id/upload-proof",
  isAuthenticated,
  upload.single("file"),
  uploadPaymentProof
);
router.put("/:id/approve", isAuthenticated, approveTransaction);
router.put("/:id/reject", isAuthenticated, rejectTransaction);

export default router;
