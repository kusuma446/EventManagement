"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomer = exports.isOrganizer = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const secret_token = config_1.JWT_SECRET !== null && config_1.JWT_SECRET !== void 0 ? config_1.JWT_SECRET : "devsecret";
const isAuthenticated = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        console.log("Token received:", token);
        if (!token)
            throw new Error("Unauthorized");
        const payload = jsonwebtoken_1.default.verify(token, String(secret_token));
        if (!payload)
            throw new Error("Invalid token");
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isAuthenticated = isAuthenticated;
const isOrganizer = (req, res, next) => {
    if (!req.user || req.user.role !== "ORGANIZER") {
        res.status(403).json({ message: "Forbidden - organizer access only" });
        return;
    }
    next();
};
exports.isOrganizer = isOrganizer;
const isCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== "CUSTOMER") {
        res.status(403).json({ message: "Forbidden - customer access only" });
    }
    next();
};
exports.isCustomer = isCustomer;
