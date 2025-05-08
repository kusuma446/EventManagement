"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Event name is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    category: zod_1.z.string().min(1, "Category is required"),
    location: zod_1.z.string().min(1, "Location is required"),
    Pay: zod_1.z.boolean(),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date",
    }),
    available_seats: zod_1.z.number().int().min(1, "At least one seat is required"),
});
exports.updateEventSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date",
    }), // bisa disesuaikan dengan ISO format
    location: zod_1.z.string().min(1),
});
