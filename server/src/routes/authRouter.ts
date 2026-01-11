import { Router } from "express";
import { register } from "../controllers/authController.js";

const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", register);

export default authRouter;