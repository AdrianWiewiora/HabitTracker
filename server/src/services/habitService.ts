import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

// Tworzenie
export const createHabit = async (data: Prisma.HabitCreateInput) => {
    return prisma.habit.create({data});
};

// Pobieranie wszystkich nawyków użytkownika
export const getHabitsByUserId = async (userId: number) => {
    return prisma.habit.findMany({
        where: { creator: { id: userId } },
        orderBy: { createdAt: 'desc' },
        include: { entries: true, notes: true }
    });
};

// Pobieranie jednego
export const getHabitById = async (habitId: number) => {
    return prisma.habit.findUnique({
        where: { id: habitId }
    });
};

// Aktualizacja
export const updateHabit = async (habitId: number, data: Prisma.HabitUpdateInput) => {
    return prisma.habit.update({
        where: { id: habitId },
        data
    });
};

// Usuwanie
export const deleteHabit = async (habitId: number) => {
    return prisma.$transaction([
        prisma.habitEntry.deleteMany({
            where: { habitId }
        }),

        prisma.note.deleteMany({
            where: { habitId }
        }),

        prisma.habit.delete({
            where: { id: habitId }
        })
    ]);
};

// === SEKCJA WPISÓW ===
export const addHabitEntry = async (habitId: number, userId: number, date: Date) => {
    return prisma.habitEntry.create({
        data: {
            habitId,
            userId,
            date,
            status: "done"
        }
    });
};

export const removeHabitEntry = async (habitId: number, userId: number, date: Date) => {
    return prisma.habitEntry.deleteMany({
        where: {
            habitId,
            userId,
            date
        }
    });
};

export const getHabitEntry = async (habitId: number, userId: number, date: Date) => {
    return prisma.habitEntry.findUnique({
        where: {
            habitId_userId_date: {
                habitId,
                userId,
                date
            }
        }
    });
};

export const upsertHabitEntry = async (habitId: number, userId: number, date: Date, status: 'done' | 'skipped') => {
    return prisma.habitEntry.upsert({
        where: {
            habitId_userId_date: {
                habitId,
                userId,
                date
            }
        },
        update: {
            status: status
        },
        create: {
            habitId,
            userId,
            date,
            status: status
        }
    });
};

export const getPopularHabitsStats = async () => {
    const publicHabits = await prisma.habit.findMany({
        where: { isPrivate: false }
    });

    const results = await Promise.all(publicHabits.map(async (habit) => {
        const count = await prisma.habit.count({
            where: {
                name: habit.name,
                isPrivate: true
            }
        });
        return { ...habit, usersCount: count };
    }));

    return results
        .sort((a, b) => b.usersCount - a.usersCount)
        .slice(0, 5);
};

export const upsertNote = async (habitId: number, userId: number, content: string) => {
    return prisma.note.upsert({
        where: {
            habitId_userId: {
                habitId,
                userId
            }
        },
        update: { content },
        create: {
            habitId,
            userId,
            content
        }
    });
};