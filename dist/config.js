"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_SECRET = exports.CLOUDINARY_KEY = exports.CLOUDINARY_NAME = exports.NODEMAILER_PASS = exports.NODEMAILER_EMAIL = exports.JWT_SECRET = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.JWT_SECRET = _a.JWT_SECRET, exports.NODEMAILER_EMAIL = _a.NODEMAILER_EMAIL, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS, exports.CLOUDINARY_NAME = _a.CLOUDINARY_NAME, exports.CLOUDINARY_KEY = _a.CLOUDINARY_KEY, exports.CLOUDINARY_SECRET = _a.CLOUDINARY_SECRET;
