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
        include: { entries: true } // Opcjonalnie: pobierz też historię wykonań
    });
};

// Pobieranie jednego (do sprawdzania czy istnieje)
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

// Usuwanie (tylko jeśli należy do usera)
export const deleteHabit = async (habitId: number) => {
    return prisma.habit.delete({
        where: { id: habitId }
    });
};

// === SEKCJA WPISÓW (ENTRIES) ===

export const addHabitEntry = async (habitId: number, userId: number, date: Date) => {
    return prisma.habitEntry.create({
        data: {
            habitId,
            userId,
            date,
            status: "done" // Domyślnie 'done', bo tak masz w Enumie
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

// Sprawdzenie czy wpis już istnieje (żeby nie wywalić błędu 500 przy dublu, tylko ładne info)
export const getHabitEntry = async (habitId: number, userId: number, date: Date) => {
    return prisma.habitEntry.findUnique({
        where: {
            habitId_userId_date: { // To jest nazwa klucza złożonego w Prisma
                habitId,
                userId,
                date
            }
        }
    });
};