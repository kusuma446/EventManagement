import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Role } from "@prisma/client";
import { AuthRequestBody, LoginRequestBody } from "../interface/interface";

const secret_token: string = JWT_SECRET ?? "devsecret";

export const registerService = async (body: AuthRequestBody) => {
  const { first_name, last_name, email, password, referral_code } = body;

  // Cek email duplikat
  const emailExist = await prisma.user.findUnique({ where: { email } });
  if (emailExist) {
    throw { status: 400, message: "Email already registered" };
  }

  // Hash password
  const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const generatedCode = Math.random().toString(36).substring(2, 8);

  // Menyimpan ID dari user yang mereferensikan (jika ada)
  let referredId: string | null = null;
  // Mengecek apakah user memasukkan kode referral saat register
  if (referral_code) {
    // Cari user yang punya kode referral tersebut di database
    const referrer = await prisma.user.findUnique({ where: { referral_code } });
    if (!referrer) {
      throw { status: 400, message: "Invalid referral code" };
    }
    // Simpan ID dari user yang berhasil ditemukan berdasarkan referral code
    referredId = referrer.id;
  }

  const newUser = await prisma.user.create({
    data: {
      first_name,
      last_name,
      email,
      password: hashed,
      role: "CUSTOMER",
      referral_code: generatedCode,
    },
  });

  // Mengecek apakah ada user yang mereferensikan (kode referral valid)
  if (referredId) {
    // Menyimpan hubungan siapa yang mereferensikan siapa
    // Tersimpan di tabel Referral
    await prisma.referral.create({
      data: {
        referrer_Id: referredId,
        referred_Id: newUser.id,
      },
    });

    // Menambahkan 10.000 poin ke akun user yang mereferensikan
    await prisma.user.update({
      where: { id: referredId },
      data: { point: { increment: 10000 } },
    });

    // Menentukan tanggal kadaluarsa kupon (3 bulan dari sekarang)
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 3);

    // Membuat kupon diskon senilai 10.000 untuk user baru
    // Pada user baru, hanya bisa dipakai 1 kali, berlaku 3 bulan
    await prisma.coupon.create({
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

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, secret_token, {
    expiresIn: "1d",
  });
  return { user: newUser, token };
};

export const loginService = async (body: LoginRequestBody) => {
  const { email, password } = body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw { status: 401, message: "Invalid credential" };
  }

  const token = jwt.sign({ id: user.id, role: user.role }, secret_token, {
    expiresIn: "1d",
  });
  return { user, token };
};
