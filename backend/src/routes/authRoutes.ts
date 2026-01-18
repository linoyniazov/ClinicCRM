import express from "express";
import { register, login } from "../controller/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
