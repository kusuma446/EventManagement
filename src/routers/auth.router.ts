import express from "express";
import { register, login } from "../controllers/auth.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", isAuthenticated, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});

export default router;
