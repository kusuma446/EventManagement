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
exports.getAuthenticatedUserController = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_service_2 = require("../services/auth.service");
const auth_service_3 = require("../services/auth.service");
const auth_service_4 = require("../services/auth.service");
const auth_service_5 = require("../services/auth.service");
const auth_service_6 = require("../services/auth.service");
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_1.registerService)(req.body);
        res.status(201).json({ message: "User registered", data });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_1.loginService)(req.body);
        res.status(201).json({ message: "Login success", data });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_2.updateProfileService)(req);
        res.status(200).json({ message: "Profile updated", data });
    }
    catch (err) {
        next(err);
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_3.changePasswordService)(req);
        res.status(200).json({ message: "Password changed successfully", data });
    }
    catch (err) {
        next(err);
    }
});
exports.changePassword = changePassword;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_4.forgotPasswordService)(req);
        res.status(200).json({ message: "Reset password link sent", data });
    }
    catch (err) {
        next(err);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_5.resetPasswordService)(req);
        res.status(200).json({ message: "Password reset successfully", data });
    }
    catch (err) {
        next(err);
    }
});
exports.resetPassword = resetPassword;
const getAuthenticatedUserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, auth_service_6.getAuthenticatedUserService)(req);
        res.status(200).json({ message: "Authenticated user retrieved", data });
    }
    catch (err) {
        next(err);
    }
});
exports.getAuthenticatedUserController = getAuthenticatedUserController;
