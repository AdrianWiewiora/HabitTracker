import { Router } from "express";
import habitsRouter from "./habitsRouter.js";

const router = Router();

router.use("/habits", habitsRouter);

export default router;
