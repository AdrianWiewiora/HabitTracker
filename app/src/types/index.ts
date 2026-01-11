// src/types/index.ts

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface HabitEntry {
    id: number;
    date: string;
    status: 'done' | 'skipped';
    habitId: number;
}

export interface Habit {
    id: number;
    name: string;
    description: string | null;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    createdAt: string;
    creatorId: number;
    entries: HabitEntry[];
}

export interface AuthResponse {
    message?: string;
    token: string;
    user: User;
}