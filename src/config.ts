import "dotenv/config";

export const {
  PORT,
  JWT_SECRET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASS,
  CLOUDINARY_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET,
} = process.env;
