import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Role } from "@prisma/client";

const secret_token: string = JWT_SECRET ?? "devsecret";

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const comparePassword = (input: string, hashed: string): boolean => {
  return bcrypt.compareSync(input, hashed);
};

export const generateToken = (payload: { id: string; role: Role }): string => {
  return jwt.sign(payload, secret_token, { expiresIn: "1d" });
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserByReferral = (code: string) => {
  return prisma.user.findUnique({ where: { referral_code: code } });
};

export const createUser = (data: any) => {
  return prisma.user.create({ data });
};

export const rewardReferral = async (
  referrerId: string,
  newUserId: string,
  code: string
) => {
  await prisma.referral.create({
    data: {
      referrer_Id: referrerId,
      referred_Id: newUserId,
    },
  });

  await prisma.user.update({
    where: { id: referrerId },
    data: { point: { increment: 10000 } },
  });

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 3);

  await prisma.coupon.create({
    data: {
      user_id: newUserId,
      code: `REF-${code.toUpperCase()}`,
      discount: 10000,
      start_date: new Date(),
      end_date: expires,
      used: false,
    },
  });
};
