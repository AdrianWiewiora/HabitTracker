import type {Request, Response} from "express";
import { getAllHabits } from "../models/habitModel.js";

export const getHabits = async (req: Request, res: Response) => {
    try {
        const habits = await getAllHabits();
        res.json(habits);
    } catch (error) {
        console.error("Error fetching habits:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
