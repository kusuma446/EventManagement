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
