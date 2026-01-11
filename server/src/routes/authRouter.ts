import { Router } from "express";
import {getMe, login, register} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { registerValidators, loginValidators, validate } from "../middlewares/validators.js";

const authRouter = Router();

// POST /api/auth/register
authRouter.post(
    "/register",
    registerValidators,
    validate,
    register
);

authRouter.post(
    "/login",
    loginValidators,
    validate,
    login
);
authRouter.get("/me", authenticateToken, getMe);

export default authRouter;