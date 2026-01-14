import { Router } from "express";
import habitsRouter from "./habitsRouter.js";
import authRouter from "./authRouter.js";

const router = Router();

router.use("/habits", habitsRouter);
router.use("/auth", authRouter);

export default router;
