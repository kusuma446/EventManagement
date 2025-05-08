"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReqValidator;
const zod_1 = require("zod");
function ReqValidator(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const message = err.errors.map((issue) => ({
                    message: issue.message,
                }));
                res.status(400).send({
                    message: "Validation Error",
                    details: message,
                });
            }
            else {
                next(err);
            }
        }
    };
}
