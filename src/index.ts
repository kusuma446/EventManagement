import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PORT } from "./config";
import path from "path";

import authRoutes from "./routers/auth.router";
import eventRoutes from "./routers/event.router";
import ticketRoutes from "./routers/ticket.router";
import transactionRoutes from "./routers/transaction.router";
import reviewRoutes from "./routers/review.router";
import dashboardRoutes from "./routers/dashboard.router";
import voucherRoutes from "./routers/voucher.router";

import { scheduleAutoExpireTransactions } from "./utils/cron/autoExpireTransactions";
import { scheduleAutoCancelUnconfirmedTransactions } from "./utils/cron/autoCancelUnconfirmedTransactions";
import { scheduleCleanupExpiredPointsAndCoupons } from "./utils/cron/cleanupExpiredPointsAndCoupons";

const port = PORT || 5050;
const app: Application = express();
dotenv.config();

scheduleAutoExpireTransactions();
scheduleAutoCancelUnconfirmedTransactions();
scheduleCleanupExpiredPointsAndCoupons;

app.use(cors());
app.use(express.json());
app.use("/avatar", express.static(path.join(__dirname, "../public/avatar")));

// Routes
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/ticket-types", ticketRoutes);
app.use("/transactions", transactionRoutes);
app.use("/reviews", reviewRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/vouchers", voucherRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
