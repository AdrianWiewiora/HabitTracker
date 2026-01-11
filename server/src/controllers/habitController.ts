import type { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createHabit,
    getHabitsByUserId,
    deleteHabit,
    updateHabit,
    getHabitById,
    removeHabitEntry, addHabitEntry, getHabitEntry
} from "../models/habitModel.js";

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

// Helper do normalizacji daty (ustawia godzinę na 00:00:00)
const normalizeDate = (dateString?: string): Date => {
    const date = dateString ? new Date(dateString) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

export const checkHabit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseInt(req.params.id);
        const userId = req.user!.id;
        // Data może przyjść w body (np. odznaczam wczoraj), a jak nie ma, to dzisiaj
        const { date } = req.body || {};

        // 1. Sprawdzamy czy nawyk istnieje i jest nasz
        const habit = await getHabitById(habitId);
        if (!habit || habit.createdBy !== userId) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        const normalizedDate = normalizeDate(date);

        // 2. Sprawdzamy czy już nie zaznaczono
        const existingEntry = await getHabitEntry(habitId, userId, normalizedDate);
        if (existingEntry) {
            res.status(409).json({ error: "Habit already checked for this date" });
            return;
        }

        // 3. Zapisujemy
        const entry = await addHabitEntry(habitId, userId, normalizedDate);
        res.status(201).json(entry);

    } catch (error) {
        console.error("Check habit error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const uncheckHabit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseInt(req.params.id);
        const userId = req.user!.id;
        const { date } = req.body || {};

        const normalizedDate = normalizeDate(date);

        // deleteMany w modelu zwróci { count: 0 } jeśli nic nie usunie, więc nie rzuci błędem
        const result = await removeHabitEntry(habitId, userId, normalizedDate);

        if (result.count === 0) {
            res.status(404).json({ message: "Entry not found or already unchecked" });
            return;
        }

        res.json({ message: "Habit unchecked" });

    } catch (error) {
        console.error("Uncheck habit error:", error);
        res.status(500).json({ error: "Server error" });
    }
};