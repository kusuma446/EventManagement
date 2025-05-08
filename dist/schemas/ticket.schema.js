"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    event_id: zod_1.z.string().min(1, "Event ID is required"),
    name: zod_1.z.string().min(1, "Ticket name is required"),
    price: zod_1.z.number().min(0, "Price must be a positive number"),
    quota: zod_1.z.number().int().min(1, "Quota must be at least 1"),
});
