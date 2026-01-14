import type { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import {
    createHabit,
    getHabitsByUserId,
    deleteHabit,
    updateHabit,
    getHabitById,
    removeHabitEntry, upsertHabitEntry, getPopularHabitsStats, upsertNote
} from "../services/habitService.js";


const parseId = (idStr: string): number => {
    const id = parseInt(idStr);
    if (isNaN(id)) throw new Error("Invalid ID");
    return id;
};

// Helper do daty
const normalizeDate = (dateString?: string): Date => {
    const date = dateString ? new Date(dateString) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

export const getPopular = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const topResults = await getPopularHabitsStats();
        res.json(topResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, frequency } = req.body;
        const userId = req.user!.id;

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
        const habit = await getHabitById(habitId);
        if (!habit || habit.createdBy !== userId) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        const updated = await updateHabit(habitId, { name, description, frequency });
        res.json(updated);

    } catch (error) {
        console.error(error);
        const status = error instanceof Error && error.message === "Invalid ID" ? 400 : 500;
        res.status(status).json({ error: "Server error" });
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

export const checkHabit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseInt(req.params.id);
        const userId = req.user!.id;

        const { date, status } = req.body || {};

        const validStatuses = ['done', 'skipped'];
        const statusToSave = validStatuses.includes(status) ? status : 'done';

        const habit = await getHabitById(habitId);
        if (!habit || habit.createdBy !== userId) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        const normalizedDate = normalizeDate(date);

        const entry = await upsertHabitEntry(habitId, userId, normalizedDate, statusToSave);

        res.status(200).json(entry); // 200 OK (bo może być update)

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

// Notes
export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const habitId = parseId(req.params.id);
        const userId = req.user!.id;
        const { content } = req.body;

        // Teraz korzystamy z serwisu, zamiast importować prisma w kontrolerze
        const note = await upsertNote(habitId, userId, content);

        res.json(note);
    } catch (error) {
        console.error("Update note error:", error);
        res.status(500).json({ error: "Server error" });
    }
};