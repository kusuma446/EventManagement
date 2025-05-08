"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const voucher_controller_1 = require("../controllers/voucher.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_middleware_2 = require("../middlewares/auth.middleware");
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const voucher_schema_1 = require("../schemas/voucher.schema");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.isAuthenticated, auth_middleware_2.isOrganizer, (0, validator_middleware_1.default)(voucher_schema_1.createVoucherSchema), voucher_controller_1.createVoucher);
exports.default = router;
