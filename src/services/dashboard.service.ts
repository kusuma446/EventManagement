import prisma from "../lib/prisma";
import { Request } from "express";

export const getOrganizerDashboardService = async (req: Request) => {
  const user = req.user!;

  if (user.role !== "ORGANIZER") {
    throw { status: 403, message: "Only organizer can access this dashboard" };
  }

  const events = await prisma.event.findMany({
    // Ambil semua event yang dibuat oleh user ini
    // Sertakan => semua jenis ticket, transaksi dalam tiap ticket, review terhadap event
    where: { organizer_id: user.id },
    include: {
      ticket_types: {
        include: { transactions: true },
      },
      reviews: true,
    },
  });

  // Ambil semua transaksi dengan status DONE
  // Hitung total harga transaksi yang sukses => totalSales
  return events.map((event) => {
    const totalSales = event.ticket_types.reduce((sum, ticket) => {
      const confirmed = ticket.transactions.filter((t) => t.status === "DONE");
      return sum + confirmed.reduce((acc, trx) => acc + trx.total_price, 0);
    }, 0);

    // Hitung jumlah tiket yang sudah terjual (berdasarkan transaksi dengan status DONE)
    const totalTicketSold = event.ticket_types.reduce((sum, ticket) => {
      return (
        sum + ticket.transactions.filter((t) => t.status === "DONE").length
      );
    }, 0);

    // Hitung rata-rata rating jika review ada
    // Jika belum ada review, beri null
    const avgRating = event.reviews.length
      ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
        event.reviews.length
      : null;

    return {
      event_id: event.id,
      event_name: event.name,
      totalSales,
      totalTicketSold,
      avgRating,
      reviewCount: event.reviews.length,
    };
  });
};

export const getAttendeesPerEvent = async (req: Request) => {
  const organizerId = req.user?.id;

  const events = await prisma.event.findMany({
    where: {
      organizer_id: organizerId,
    },
    select: {
      id: true,
      name: true,
      ticket_types: {
        select: {
          transactions: {
            where: { status: "DONE" },
            select: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return events.map((event) => ({
    event_id: event.id,
    event_name: event.name,
    attendees: event.ticket_types
      .flatMap((tt) => tt.transactions)
      .map((trx) => trx.user),
  }));
};

export const getStatisticsSummaryService = async (req: Request) => {
  const organizerId = req.user?.id;

  const events = await prisma.event.findMany({
    where: { organizer_id: organizerId },
    include: {
      ticket_types: {
        include: {
          transactions: {
            where: { status: "DONE" },
          },
        },
      },
    },
  });

  let totalRevenue = 0;
  let totalTicketsSold = 0;
  let totalTransactions = 0;

  events.forEach((event) => {
    event.ticket_types.forEach((ticket) => {
      const doneTx = ticket.transactions;
      totalTransactions += doneTx.length;
      totalTicketsSold += doneTx.length;
      totalRevenue += doneTx.reduce((acc, t) => acc + t.total_price, 0);
    });
  });

  return {
    totalEvents: events.length,
    totalRevenue,
    totalTicketsSold,
    totalTransactions,
  };
};

export const getMonthlyRevenueByYear = async (req: Request) => {
  const organizerId = req.user?.id;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  const result = await prisma.transaction.groupBy({
    by: ["created_at"],
    where: {
      status: "DONE",
      ticket_type: {
        event: {
          organizer_id: organizerId,
        },
      },
      created_at: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
    _sum: {
      total_price: true,
    },
  });

  const monthlyRevenue = Array(12).fill(0);

  result.forEach((item) => {
    const month = new Date(item.created_at).getMonth(); // 0-11
    monthlyRevenue[month] += item._sum.total_price || 0;
  });

  return monthlyRevenue.map((value, index) => ({
    month: new Date(0, index).toLocaleString("id-ID", { month: "long" }),
    revenue: value,
  }));
};
