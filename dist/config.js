"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODEMAILER_PASS = exports.NODEMAILER_EMAIL = exports.JWT_SECRET = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.JWT_SECRET = _a.JWT_SECRET, exports.NODEMAILER_EMAIL = _a.NODEMAILER_EMAIL, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS;
