import { Request, Response, NextFunction } from "express";
import { createVoucherService } from "../services/voucher.service";

export const createVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createVoucherService(req);
    res.status(201).json({ message: "Voucher created", data });
  } catch (err) {
    next(err);
  }
};
