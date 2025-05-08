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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedUserService = exports.resetPasswordService = exports.forgotPasswordService = exports.changePasswordService = exports.updateProfileService = exports.loginService = exports.registerService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const nodemailer_1 = require("../utils/nodemailer");
const secret_token = config_1.JWT_SECRET !== null && config_1.JWT_SECRET !== void 0 ? config_1.JWT_SECRET : "devsecret";
const registerService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, email, password, role, referral_code } = body;
    // Cek email duplikat
    const emailExist = yield prisma_1.default.user.findUnique({ where: { email } });
    if (emailExist) {
        throw { status: 400, message: "Email already registered" };
    }
    // Hash password
    const hashed = bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(10));
    const generatedCode = Math.random().toString(36).substring(2, 8);
    // Menyimpan ID dari user yang mereferensikan (jika ada)
    let referredId = null;
    // Mengecek apakah user memasukkan kode referral saat register
    if (referral_code) {
        // Cari user yang punya kode referral tersebut di database
        const referrer = yield prisma_1.default.user.findUnique({ where: { referral_code } });
        if (!referrer) {
            throw { status: 400, message: "Invalid referral code" };
        }
        // Simpan ID dari user yang berhasil ditemukan berdasarkan referral code
        referredId = referrer.id;
    }
    // Validasi role
    if (!["CUSTOMER", "ORGANIZER"].includes(role)) {
        throw { status: 400, message: "Invalid role" };
    }
    const newUser = yield prisma_1.default.user.create({
        data: {
            first_name,
            last_name,
            email,
            password: hashed,
            role,
            referral_code: generatedCode,
        },
    });
    // Mengecek apakah ada user yang mereferensikan (kode referral valid)
    if (referredId) {
        // Menyimpan hubungan siapa yang mereferensikan siapa
        // Tersimpan di tabel Referral
        yield prisma_1.default.referral.create({
            data: {
                referrer_Id: referredId,
                referred_Id: newUser.id,
            },
        });
        // Menambahkan 10.000 poin ke akun user yang mereferensikan
        yield prisma_1.default.user.update({
            where: { id: referredId },
            data: { point: { increment: 10000 } },
        });
        // Menentukan tanggal kadaluarsa kupon (3 bulan dari sekarang)
        const expires = new Date();
        expires.setMonth(expires.getMonth() + 3);
        // Membuat kupon diskon senilai 10.000 untuk user baru
        // Pada user baru, hanya bisa dipakai 1 kali, berlaku 3 bulan
        yield prisma_1.default.coupon.create({
            data: {
                user_id: newUser.id,
                code: `REF-${generatedCode.toUpperCase()}`,
                discount: 10000,
                start_date: new Date(),
                end_date: expires,
                used: false,
            },
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: newUser.id, role: newUser.role }, secret_token, {
        expiresIn: "1d",
    });
    return { user: newUser, token };
});
exports.registerService = registerService;
const loginService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = body;
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user || !bcrypt_1.default.compareSync(password, user.password)) {
        throw { status: 401, message: "Invalid credential" };
    }
    // // dispatch(
    //   onLogin({
    //     user: {
    //       email: data.data.user.email,
    //       first_name: data.data.user.first_name,
    //       last_name: data.data.user.last_name,
    //       role: data.data.user.role,
    //       avatar: data.data.user.avatar, // jika tersedia
    //     },
    //     isLogin: true,
    //   })
    // );
    // *singkron dengan redux
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        profile_pict: user.profile_pict,
    }, secret_token, {
        expiresIn: "1d",
    });
    return { user, token };
});
exports.loginService = loginService;
const updateProfileService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { first_name, last_name } = req.body;
    // Ambil file upload jika ada (profile picture)
    const file = req.file;
    // Jika file ada, set path foto profile ke /avatar/namafile, kalau tidak undefined
    const profile_pict = file ? `/avatar/${file.filename}` : undefined;
    const updated = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: Object.assign({ first_name,
            last_name }, (profile_pict && { profile_pict })),
    });
    return updated;
});
exports.updateProfileService = updateProfileService;
const changePasswordService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { old_password, new_password } = req.body;
    const existingUser = yield prisma_1.default.user.findUnique({ where: { id: user.id } });
    if (!existingUser)
        throw { status: 404, message: "User not found" };
    // Cek apakah password lama yang dikirim cocok dengan password di database
    const match = yield bcrypt_1.default.compare(old_password, existingUser.password);
    if (!match)
        throw { status: 400, message: "Old password is incorrect" };
    // Hash (enkripsi) password baru
    const hashed = bcrypt_1.default.hashSync(new_password, 10);
    // Update password baru
    const updated = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: { password: hashed },
    });
    return { id: updated.id, email: updated.email };
});
exports.changePasswordService = changePasswordService;
const forgotPasswordService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw { status: 404, message: "User not found" };
    // Generate JWT token untuk reset password (berlaku 15 menit)
    const token = jsonwebtoken_1.default.sign({ id: user.id }, secret_token, { expiresIn: "15min" });
    // Buat link reset password yang berisi token
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    yield (0, nodemailer_1.sendEmail)(email, "Reset Your Password", `<p>Click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`);
    return { email, resetLink };
});
exports.forgotPasswordService = forgotPasswordService;
const resetPasswordService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, new_password } = req.body;
    try {
        // Verifikasi token yang dikirim user
        const payload = jsonwebtoken_1.default.verify(token, secret_token);
        // Hash (enkripsi) password baru sebelum disimpan
        const hashed = bcrypt_1.default.hashSync(new_password, 10);
        // Update password user di database berdasarkan id dari token
        const updated = yield prisma_1.default.user.update({
            where: { id: payload.id },
            data: { password: hashed },
        });
        return { id: updated.id, email: updated.email };
    }
    catch (error) {
        throw { status: 400, message: "Invalid or expired token" };
    }
});
exports.resetPasswordService = resetPasswordService;
const getAuthenticatedUserService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw { status: 401, message: "Unauthorized" };
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            first_name: true,
            last_name: true,
            email: true,
            profile_pict: true,
            referral_code: true,
            point: true,
            coupons: {
                select: {
                    id: true,
                    code: true,
                    discount: true,
                    end_date: true,
                },
            },
        },
    });
    if (!user) {
        throw { status: 404, message: "User not found" };
    }
    return user;
});
exports.getAuthenticatedUserService = getAuthenticatedUserService;
