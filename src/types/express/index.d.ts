import { Role } from "@prisma/client";
import { File } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
      file?: File;
    }
  }
}

export {};
