import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";

export const getOrganizerDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== "ORGANIZER") {
      res
        .status(403)
        .json({ message: "Only organizer can access this dashboard" });
      return;
    }

    // Tampilkan event - event yang dimiliki ole organizer
    const events = await dashboardService.getEventsByOrganizer(user.id);

    const dashboard = events.map((event) => {
      const totalSales = event.ticket_types.reduce((sum, ticket) => {
        const comfirmedTransactions = ticket.transactions.filter(
          (t) => t.status === "DONE"
        );
        return (
          sum + comfirmedTransactions.reduce((sub, t) => sub + t.total_price, 0)
        );
      }, 0);

      const totalTicketSold = event.ticket_types.reduce((count, ticket) => {
        return (
          count + ticket.transactions.filter((t) => t.status === "DONE").length
        );
      }, 0);

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

    res.status(200).json({ dashboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
