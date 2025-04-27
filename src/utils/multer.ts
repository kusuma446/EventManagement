import { Request } from "express";
import multer from "multer";
import path from "path";

export function Multer(
  type: "memoryStorage" | "diskStorage" = "memoryStorage",
  filePrefix?: string,
  folderName?: string
) {
  const defaultDir = path.join(__dirname, "../../public");

  const storage =
    type === "memoryStorage"
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (
            req: Request,
            file: Express.Multer.File,
            cb: (err: Error | null, destination: string) => void
          ) => {
            cb(
              null,
              folderName ? path.join(defaultDir, folderName) : defaultDir
            );
          },
          filename: (
            req: Request,
            file: Express.Multer.File,
            cb: (err: Error | null, filename: string) => void
          ) => {
            const prefix = filePrefix || "file-";
            const originalNameParts = file.originalname.split(".");
            const fileExtension = originalNameParts.pop();
            const fileBase = originalNameParts.join(".");

            cb(null, `${prefix}${Date.now()}-${fileBase}.${fileExtension}`);
          },
        });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
}
