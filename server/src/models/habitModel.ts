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