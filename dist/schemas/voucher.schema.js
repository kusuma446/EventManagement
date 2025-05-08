"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVoucherSchema = void 0;
const zod_1 = require("zod");
exports.createVoucherSchema = zod_1.z.object({
    event_id: zod_1.z.string().min(1, "Event ID is required"),
    code: zod_1.z.string().min(1, "Code is required"),
    discount: zod_1.z.number().int().min(1, "Discount must be greater than 0"),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }),
});
