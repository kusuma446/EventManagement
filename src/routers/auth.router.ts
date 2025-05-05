import express from "express";
import {
  register,
  login,
  changePassword,
  forgotPassword,
  getAuthenticatedUserController,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";
import ReqValidator from "../middlewares/validator.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { Multer } from "../utils/multer";
import { updateProfile } from "../controllers/auth.controller";
import { updateProfileSchema } from "../schemas/auth.schema";
import { changePasswordSchema } from "../schemas/auth.schema";
import { forgotPasswordSchema } from "../schemas/auth.schema";
import { resetPassword } from "../controllers/auth.controller";
import { resetPasswordSchema } from "../schemas/auth.schema";

const router = express.Router();
const upload = Multer("diskStorage", "avatar-", "avatar");

router.post("/register", ReqValidator(registerSchema), register);
router.post("/login", ReqValidator(loginSchema), login);
router.get("/me", isAuthenticated, getAuthenticatedUserController);
router.patch(
  "/profile",
  isAuthenticated,
  upload.single("file"),
  ReqValidator(updateProfileSchema),
  updateProfile
);
router.patch(
  "/password",
  isAuthenticated,
  ReqValidator(changePasswordSchema),
  changePassword
);

router.post(
  "/forgot-password",
  ReqValidator(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  ReqValidator(resetPasswordSchema),
  resetPassword
);

export default router;
