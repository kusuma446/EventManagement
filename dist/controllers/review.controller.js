"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByEvent = exports.createReview = void 0;
const review_service_1 = require("../services/review.service");
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, review_service_1.createReviewService)(req);
        res.status(201).json({ message: "Review submitted", data });
    }
    catch (error) {
        next(error);
    }
});
exports.createReview = createReview;
const getReviewsByEvent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, review_service_1.getReviewsByEventService)(req.params.eventId);
        res.status(200).json({ reviews: data });
    }
    catch (error) {
        next(error);
    }
});
exports.getReviewsByEvent = getReviewsByEvent;
