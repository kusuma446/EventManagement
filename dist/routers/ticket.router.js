"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ticket_controller_1 = require("../controllers/ticket.controller");
const validator_middleware_1 = __importDefault(require("../middlewares/validator.middleware"));
const ticket_schema_1 = require("../schemas/ticket.schema");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, (0, validator_middleware_1.default)(ticket_schema_1.createTicketSchema), ticket_controller_1.createTicketType);
router.get("/", auth_middleware_1.isAuthenticated, auth_middleware_1.isOrganizer, ticket_controller_1.getTicketTypes);
exports.default = router;
