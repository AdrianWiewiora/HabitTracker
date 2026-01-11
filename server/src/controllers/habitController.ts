import type { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { createHabit, getHabitsByUserId, deleteHabit, updateHabit, getHabitById } from "../models/habitModel.js";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, frequency } = req.body;
        const userId = req.user!.id; // Wykrzyknik, bo middleware gwarantuje, że user jest

        const newHabit = await createHabit({
            name,
            description,
            frequency,
            creator: { connect: { id: userId } }
        });

        res.status(201).json(newHabit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const habits = await getHabitsByUserId(userId);
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseInt(req.params.id);
        const userId = req.user!.id;
        const { name, description, frequency } = req.body;

        // 1. Sprawdź czy nawyk istnieje i należy do usera
        const habit = await getHabitById(habitId);
        if (!habit || habit.createdBy !== userId) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        // 2. Aktualizuj
        const updated = await updateHabit(habitId, { name, description, frequency });
        res.json(updated);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseInt(req.params.id);
        const userId = req.user!.id;

        const habit = await getHabitById(habitId);
        if (!habit || habit.createdBy !== userId) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        await deleteHabit(habitId);
        res.json({ message: "Habit deleted" });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};