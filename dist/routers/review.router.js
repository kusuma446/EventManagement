"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const review_controller_1 = require("../controllers/review.controller");
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const review_schema_1 = require("../schemas/review.schema");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.isAuthenticated, auth_middleware_1.isCustomer, (0, validator_middleware_1.default)(review_schema_1.createReviewSchema), review_controller_1.createReview);
router.get("/event/:eventId", review_controller_1.getReviewsByEvent);
exports.default = router;
