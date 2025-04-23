import { Request, Response } from "express";
import { AuthRequestBody, LoginRequestBody } from "../interface/interface";
import * as authService from "../services/auth.service";

export const register = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { first_name, last_name, email, password, referral_code } = req.body;

    const emailExist = await authService.findUserByEmail(email);
    if (emailExist) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashed = authService.hashPassword(password);
    const generatedCode = Math.random().toString(36).substring(2, 8);

    let referredId: string | null = null;

    if (referral_code) {
      const referrer = await authService.findUserByReferral(referral_code);
      if (!referrer) {
        res.status(400).json({ message: "Invalid referral code" });
        return;
      }
      referredId = referrer.id;
    }

    const newUser = await authService.createUser({
      first_name,
      last_name,
      email,
      password: hashed,
      role: "CUSTOMER",
      referral_code: generatedCode,
    });

    if (referredId) {
      await authService.rewardReferral(referredId, newUser.id, generatedCode);
    }

    const token = authService.generateToken({
      id: newUser.id,
      role: newUser.role,
    });
    res.status(201).json({ message: "User registered", user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user || !authService.comparePassword(password, user.password)) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = authService.generateToken({ id: user.id, role: user.role });
    res.status(200).json({ message: "Login succes", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
