import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PORT } from "./config";

import authRoutes from "./routers/auth.router";
import eventRoutes from "./routers/event.router";
import ticketRoutes from "./routers/ticket.router";
import transactionRoutes from "./routers/transaction.router";
import reviewRoutes from "./routers/review.router";
import dashboardRoutes from "./routers/dashboard.router";

const port = PORT || 5050;
const app: Application = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ticket-types", ticketRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
