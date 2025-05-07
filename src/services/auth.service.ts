import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Request } from "express";
import { AuthRequestBody, LoginRequestBody } from "../interface/interface";
import { sendEmail } from "../utils/nodemailer";

const secret_token: string = JWT_SECRET ?? "devsecret";

export const registerService = async (body: AuthRequestBody) => {
  const { first_name, last_name, email, password, role, referral_code } = body;

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

  // Validasi role
  if (!["CUSTOMER", "ORGANIZER"].includes(role)) {
    throw { status: 400, message: "Invalid role" };
  }

  const newUser = await prisma.user.create({
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

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      profile_pict: user.profile_pict,
    },
    secret_token,
    {
      expiresIn: "1d",
    }
  );
  return { user, token };
};

export const updateProfileService = async (req: Request) => {
  const user = req.user!;
  const { first_name, last_name } = req.body;

  // Ambil file upload jika ada (profile picture)
  const file = req.file;
  // Jika file ada, set path foto profile ke /avatar/namafile, kalau tidak undefined
  const profile_pict = file ? `/avatar/${file.filename}` : undefined;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      first_name,
      last_name,
      ...(profile_pict && { profile_pict }),
    },
  });

  return updated;
};

export const changePasswordService = async (req: Request) => {
  const user = req.user!;
  const { old_password, new_password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!existingUser) throw { status: 404, message: "User not found" };

  // Cek apakah password lama yang dikirim cocok dengan password di database
  const match = await bcrypt.compare(old_password, existingUser.password);
  if (!match) throw { status: 400, message: "Old password is incorrect" };

  // Hash (enkripsi) password baru
  const hashed = bcrypt.hashSync(new_password, 10);
  // Update password baru
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { id: updated.id, email: updated.email };
};

export const forgotPasswordService = async (req: Request) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 404, message: "User not found" };

  // Generate JWT token untuk reset password (berlaku 15 menit)
  const token = jwt.sign({ id: user.id }, secret_token, { expiresIn: "15min" });

  // Buat link reset password yang berisi token
  const resetLink = `http://localhost:5050/reset-password/${token}`;

  await sendEmail(
    email,
    "Reset Your Password",
    `<p>Click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`
  );

  return { email, resetLink };
};

export const resetPasswordService = async (req: Request) => {
  const { token, new_password } = req.body;

  try {
    // Verifikasi token yang dikirim user
    const payload = jwt.verify(token, secret_token) as { id: string };
    // Hash (enkripsi) password baru sebelum disimpan
    const hashed = bcrypt.hashSync(new_password, 10);

    // Update password user di database berdasarkan id dari token
    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashed },
    });

    return { id: updated.id, email: updated.email };
  } catch (error) {
    throw { status: 400, message: "Invalid or expired token" };
  }
};

export const getAuthenticatedUserService = async (req: Request) => {
  const userId = req.user?.id;

  if (!userId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
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
};
