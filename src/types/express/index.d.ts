import { Role } from "@prisma/client";
import { File } from "multer";

export interface AuthPayload {
  id: string;
  role: Role;
}
declare global {
  namespace Express {
    export interface Request {
      user?: AuthPayload;
      file?: File;
    }
  }
}
