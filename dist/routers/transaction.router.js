"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const transaction_controller_1 = require("../controllers/transaction.controller");
const multer_1 = __importDefault(require("multer"));
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const transaction_schema_1 = require("../schemas/transaction.schema");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
router.post("/", auth_middleware_1.isAuthenticated, auth_middleware_1.isCustomer, (0, validator_middleware_1.default)(transaction_schema_1.createTransactionSchema), transaction_controller_1.createTransaction);
router.put("/:id/upload-proof", auth_middleware_1.isAuthenticated, upload.single("file"), auth_middleware_1.isCustomer, transaction_controller_1.uploadPaymentProof);
router.get("/organizer", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, transaction_controller_1.getOrganizerTransactions);
router.put("/:id/approve", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, transaction_controller_1.approveTransaction);
router.put("/:id/reject", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, transaction_controller_1.rejectTransaction);
exports.default = router;
