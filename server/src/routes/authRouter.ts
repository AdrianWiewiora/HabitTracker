import { Router } from "express";
import {getMe, login, register, savePushSubscription, updateProfile, googleLogin} from "../controllers/authController.js";
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
authRouter.post("/google", googleLogin);
authRouter.get("/me", authenticateToken, getMe);
authRouter.post('/push-subscription', authenticateToken, savePushSubscription);
authRouter.put("/update-profile", authenticateToken, updateProfile);

export default authRouter;