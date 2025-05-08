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
exports.getTicketTypes = exports.createTicketType = void 0;
const ticket_service_1 = require("../services/ticket.service");
const createTicketType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, ticket_service_1.createTicketTypeService)(req);
        res.status(201).json({ message: "Ticket type created", data });
    }
    catch (error) {
        next(error);
    }
});
exports.createTicketType = createTicketType;
const getTicketTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, ticket_service_1.getTicketTypesService)(req);
        res.status(200).json(data);
    }
    catch (err) {
        next(err);
    }
});
exports.getTicketTypes = getTicketTypes;
