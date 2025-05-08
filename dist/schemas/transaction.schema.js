"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    ticket_type_id: zod_1.z.string().min(1, "Ticket type ID is required"),
    voucher_id: zod_1.z.string().optional(),
    coupon_id: zod_1.z.string().optional(),
    used_points: zod_1.z.number().int().min(0).optional(),
});
