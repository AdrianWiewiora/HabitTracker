import { Router } from "express";
import { create, getAll, remove, update } from "../controllers/habitController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { habitValidators, validate } from "../middlewares/validators.js";

const habitsRouter = Router();

habitsRouter.use(authenticateToken);

habitsRouter.get("/", getAll);

habitsRouter.post(
    "/",
    habitValidators,
    validate,
    create
);

habitsRouter.put(
    "/:id",
    habitValidators,
    validate,
    update
);

habitsRouter.delete("/:id", remove);

export default habitsRouter;