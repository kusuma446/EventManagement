import { Request, Response } from "express";
import prisma from "../lib/prisma";
import path from "path";
import { TransactionStatus } from "@prisma/client";
import fs from "fs";
import * as trxService from "../services/transaction.service";

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { ticket_type_id, used_points, voucher_id, coupon_id } = req.body;

    if (!ticket_type_id) {
      res.status(400).json({ message: "ticket_type_id is required" });
      return;
    }

    const ticket = await prisma.ticketType.findUnique({
      where: { id: ticket_type_id },
    });
    if (!ticket || ticket.quota <= 0) {
      res.status(400).json({ message: "Ticket not available" });
      return;
    }

    const existing = await prisma.transaction.findFirst({
      where: {
        user_id: user.id,
        ticket_type_id,
      },
    });
    if (existing) {
      res.status(400).json({ message: "You already purchased this ticket" });
      return;
    }

    const total_price: number = ticket.price - (used_points || 0);

    const transaction = await trxService.createTransaction({
      user_id: user.id,
      ticket_type_id,
      total_price,
      status: TransactionStatus.WAITING_PAYMENT,
      used_points: used_points || 0,
      voucher_id,
      coupon_id,
    });

    await trxService.updateTicketQuota(ticket_type_id);

    if (coupon_id) await trxService.markCouponUsed(coupon_id);
    if (used_points) await trxService.deductUserPoints(user.id, used_points);

    res.status(201).json({ message: "Transaction created", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadPaymentProof = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const filePath = path.join("uploads", req.file.filename);
    res
      .status(200)
      .json({ message: "Payment proof uploaded successfully", path: filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const approveTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const transaction = await trxService.getTransactionWithEvent(id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    if (transaction.ticket_type?.event.organizer_id !== user.id) {
      res
        .status(403)
        .json({ message: "You are not the organizer of this event" });
    }

    await trxService.updateTransactionStatus(id, TransactionStatus.DONE);
    res.status(200).json({ message: "Transaction approved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const transaction = await trxService.getTransactionWithEvent(id);
    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    if (transaction.ticket_type?.event.organizer_id !== user.id) {
      res
        .status(403)
        .json({ message: "You are not the organizer of this event" });
      return;
    }

    if (transaction.ticket_type_id) {
      await trxService.restoreTicketQuota(transaction.ticket_type_id as string);
    }

    await trxService.updateTransactionStatus(id, TransactionStatus.REJECTED);
    res.status(200).json({ message: "Transaction rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const autoCancelTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expired = await trxService.getExpiredTransaction();

    for (const trx of expired) {
      await trxService.updateTransactionStatus(
        trx.id,
        TransactionStatus.EXPIRED
      );

      if (trx.ticket_type_id) {
        await trxService.restoreTicketQuota(trx.ticket_type_id as string);
      }

      if (trx.coupon_id) {
        await trxService.unmarkCouponUsed(trx.coupon_id);
      }

      if (trx.used_points > 0) {
        await trxService.restoreUserPoints(trx.user_id, trx.used_points);
      }
    }

    res
      .status(200)
      .json({ message: `${expired.length} transaction(s) auto-canceled` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
