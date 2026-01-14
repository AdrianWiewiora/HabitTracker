import type {Habit} from '../types';


// Zwraca datę z wyzerowaną godziną (00:00:00) do porównań
export const normalizeDate = (dateInput: string | Date | number): Date => {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Zwraca klucz daty w formacie YYYY-MM-DD (czas lokalny)
export const getDateKey = (dateInput: string | Date | number): string => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-CA');
};

// Oblicza różnicę w dniach między dwoma timestampami/datami
export const getDaysDiff = (date1: Date | number, date2: Date | number): number => {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((d1 - d2) / oneDay));
};


export const calculateCurrentStreak = (habit: Habit): number => {
    const doneEntries = habit.entries
        .filter(e => e.status === 'done')
        .map(e => normalizeDate(e.date).getTime())
        .sort((a, b) => b - a);

    const uniqueDates = Array.from(new Set(doneEntries));
    if (uniqueDates.length === 0) return 0;

    const today = normalizeDate(new Date()).getTime();
    const yesterday = today - (24 * 60 * 60 * 1000);
    const lastEntryDate = uniqueDates[0];

    if (lastEntryDate !== today && lastEntryDate !== yesterday) {
        return 0; // Passa przerwana
    }

    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (getDaysDiff(uniqueDates[i], uniqueDates[i+1]) === 1) {
            currentStreak++;
        } else {
            break;
        }
    }
    return currentStreak;
};