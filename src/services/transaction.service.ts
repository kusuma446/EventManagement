import prisma from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";

export const createTransaction = async (data: any) => {
  return prisma.transaction.create({ data });
};

export const updateTicketQuota = async (ticket_type_id: string) => {
  return prisma.ticketType.update({
    where: { id: ticket_type_id },
    data: { quota: { decrement: 1 } },
  });
};

export const restoreTicketQuota = async (ticket_type_id: string) => {
  return prisma.ticketType.update({
    where: { id: ticket_type_id },
    data: { quota: { increment: 1 } },
  });
};

export const markCouponUsed = async (coupon_id: string) => {
  return prisma.coupon.update({
    where: { id: coupon_id },
    data: { used: true },
  });
};

export const unmarkCouponUsed = async (coupon_id: string) => {
  return prisma.coupon.update({
    where: { id: coupon_id },
    data: { used: false },
  });
};

export const deductUserPoints = async (user_id: string, amount: number) => {
  return prisma.user.update({
    where: { id: user_id },
    data: { point: { decrement: amount } },
  });
};

export const restoreUserPoints = async (user_id: string, amount: number) => {
  return prisma.user.update({
    where: { id: user_id },
    data: { point: { increment: amount } },
  });
};

export const updateTransactionStatus = async (
  id: string,
  status: TransactionStatus
) => {
  return prisma.transaction.update({
    where: { id },
    data: { status },
  });
};

export const getExpiredTransaction = async () => {
  const now = new Date();
  return prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      created_at: {
        lt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    },
  });
};

export const getTransactionWithEvent = (id: string) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      ticket_type: {
        include: { event: true },
      },
    },
  });
};
