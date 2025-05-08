"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    event_id: zod_1.z.string().min(1, "Event ID is required"),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(1, "Comment is required"),
});
