import { CorsOptions } from "cors";

const whitelist = ["http://localhost:3000", "http://192.168.1.5:3000"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
