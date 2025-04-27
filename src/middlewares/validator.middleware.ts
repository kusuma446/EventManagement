import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export default function ReqValidator(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map((issue) => ({
          message: issue.message,
        }));

        res.status(400).send({
          message: "Validation Error",
          details: message,
        });
      } else {
        next(err);
      }
    }
  };
}
