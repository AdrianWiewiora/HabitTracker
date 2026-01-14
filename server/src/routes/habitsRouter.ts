import { Router } from "express";
import {
    checkHabit,
    create,
    getAll,
    getPopular,
    remove,
    uncheckHabit,
    update,
    updateNote
} from "../controllers/habitController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { habitValidators, validate } from "../middlewares/validators.js";

const habitsRouter = Router();

habitsRouter.use(authenticateToken);

habitsRouter.get("/", getAll);

habitsRouter.get("/popular", getPopular);

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

habitsRouter.post("/:id/check", checkHabit);
habitsRouter.delete("/:id/check", uncheckHabit);
habitsRouter.put("/:id/note", updateNote);

export default habitsRouter;