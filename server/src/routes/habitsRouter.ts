import { Router } from "express";
import { getHabits } from "../controllers/habitController.js";

const habitsRouter = Router();

habitsRouter.get("/", getHabits);

export default habitsRouter;
