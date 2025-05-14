import { Request, Response, NextFunction } from "express";
import {
  createVoucherService,
  getVouchersWithEventService,
  getVouchersByEventIdService,
} from "../services/voucher.service";

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

export const getVouchersWithEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getVouchersWithEventService(req);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getVouchersByEventId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.query.event_id as string;
    const data = await getVouchersByEventIdService(eventId, req);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
