import type { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import prisma from "../utils/prisma.js";

export const getCommunityStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        // 1. ACTIVE USERS TODAY
        const activeUsersCount = await prisma.habitEntry.groupBy({
            by: ['userId'],
            where: { date: { gte: today } },
        });
        const activeUsers = activeUsersCount.length;

        // 2. NEW HABITS THIS WEEK
        const newHabits = await prisma.habit.count({
            where: { createdAt: { gte: oneWeekAgo } }
        });

        // 3. TOP HABITS THIS WEEK (Poprawiona logika)
        // Pobieramy wpisy z ostatniego tygodnia
        const entries = await prisma.habitEntry.findMany({
            where: {
                date: { gte: oneWeekAgo },
                status: 'done'
            },
            include: {
                habit: { select: { name: true } }
            }
        });

        // Mapa: Nazwa Habit -> Zbiór (Set) unikalnych UserID
        // Dzięki temu, jeśli jeden user zrobił "Woda" 5 razy, policzy się jako 1 user.
        const habitUsersMap: Record<string, Set<number>> = {};

        entries.forEach(entry => {
            const name = entry.habit.name.trim(); // Normalizacja nazwy

            if (!habitUsersMap[name]) {
                habitUsersMap[name] = new Set();
            }
            habitUsersMap[name].add(entry.userId);
        });

        // Konwersja mapy na tablicę i sortowanie po wielkości zbioru (ilości userów)
        const sortedHabits = Object.entries(habitUsersMap)
            .map(([name, userSet]) => ({
                name,
                count: userSet.size // .size zwraca ilość unikalnych userów
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        res.json({
            activeUsers,
            newHabits,
            topHabits: sortedHabits
        });

    } catch (error) {
        console.error("Community stats error:", error);
        res.status(500).json({ error: "Server error" });
    }
};