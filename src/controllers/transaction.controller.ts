import { Request, Response, NextFunction } from "express";
import {
  createTransactionService,
  uploadPaymentProofService,
  getOrganizerTransactionsService,
  approveTransactionService,
  rejectTransactionService,
  autoCancelExpiredTransactionsService,
} from "../services/transaction.service";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createTransactionService(req);
    res.status(201).json({ message: "Transaction created", data });
  } catch (error) {
    next(error);
  }
};

export const uploadPaymentProof = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await uploadPaymentProofService(req);
    res.status(200).json({ message: "Proof uploaded", data });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getOrganizerTransactionsService(req);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

export const approveTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await approveTransactionService(req);
    res.status(200).json({ message: "Transaction approved", data });
  } catch (error) {
    next(error);
  }
};

export const rejectTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await rejectTransactionService(req);
    res.status(200).json({ message: "Transaction rejected", data });
  } catch (error) {
    next(error);
  }
};

export const autoCancelExpiredTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await autoCancelExpiredTransactionsService();
    res
      .status(200)
      .json({ message: `${data.length} transaction(s) auto-canceled`, data });
  } catch (error) {
    next(error);
  }
};
