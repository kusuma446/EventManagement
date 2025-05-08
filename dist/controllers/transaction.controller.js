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
exports.autoCancelExpiredTransactions = exports.rejectTransaction = exports.approveTransaction = exports.getOrganizerTransactions = exports.uploadPaymentProof = exports.createTransaction = void 0;
const transaction_service_1 = require("../services/transaction.service");
const createTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.createTransactionService)(req);
        res.status(201).json({ message: "Transaction created", data });
    }
    catch (error) {
        next(error);
    }
});
exports.createTransaction = createTransaction;
const uploadPaymentProof = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.uploadPaymentProofService)(req);
        res.status(200).json({ message: "Proof uploaded", data });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadPaymentProof = uploadPaymentProof;
const getOrganizerTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.getOrganizerTransactionsService)(req);
        res.status(200).json(data);
    }
    catch (err) {
        next(err);
    }
});
exports.getOrganizerTransactions = getOrganizerTransactions;
const approveTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.approveTransactionService)(req);
        res.status(200).json({ message: "Transaction approved", data });
    }
    catch (error) {
        next(error);
    }
});
exports.approveTransaction = approveTransaction;
const rejectTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.rejectTransactionService)(req);
        res.status(200).json({ message: "Transaction rejected", data });
    }
    catch (error) {
        next(error);
    }
});
exports.rejectTransaction = rejectTransaction;
const autoCancelExpiredTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, transaction_service_1.autoCancelExpiredTransactionsService)();
        res
            .status(200)
            .json({ message: `${data.length} transaction(s) auto-canceled`, data });
    }
    catch (error) {
        next(error);
    }
});
exports.autoCancelExpiredTransactions = autoCancelExpiredTransactions;
