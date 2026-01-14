import { useMemo } from 'react';
import type { Habit } from '../../../types';
import { FaCheck, FaFire, FaTrophy } from 'react-icons/fa';
import './ProgressOverview.scss';
import {getDaysDiff, normalizeDate} from "../../../utils/dateHelpers.ts";

export default function ProgressOverview({ habit }: { habit: Habit }) {

    const stats = useMemo(() => {
        const doneEntries = habit.entries
            .filter(e => e.status === 'done')
            .map(e => normalizeDate(e.date).getTime())
            .sort((a, b) => b - a); // Malejąco (najnowsze)

        const uniqueDates = Array.from(new Set(doneEntries));

        const totalCompleted = uniqueDates.length;
        if (totalCompleted === 0) {
            return { total: 0, current: 0, best: 0 };
        }

        // --- OBLICZANIE CURRENT STREAK ---
        let currentStreak = 0;
        const today = normalizeDate(new Date()).getTime();
        const yesterday = today - (24 * 60 * 60 * 1000);

        const lastEntryDate = uniqueDates[0];

        // Sprawdzamy czy ostatni wpis to dzisiaj lub wczoraj
        if (lastEntryDate === today || lastEntryDate === yesterday) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDates.length - 1; i++) {
                // TU UŻYWAMY FUNKCJI getDaysDiff
                const diff = getDaysDiff(uniqueDates[i], uniqueDates[i+1]);

                if (diff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // --- OBLICZANIE BEST STREAK ---
        let bestStreak = 1;
        let tempStreak = 1;

        // Sortujemy rosnąco do liczenia best streak
        const sortedAsc = [...uniqueDates].sort((a, b) => a - b);

        for (let i = 0; i < sortedAsc.length - 1; i++) {
            // TU TEŻ UŻYWAMY FUNKCJI
            const diff = getDaysDiff(sortedAsc[i+1], sortedAsc[i]);

            if (diff === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > bestStreak) bestStreak = tempStreak;
        }

        return {
            total: totalCompleted,
            current: currentStreak,
            best: bestStreak
        };

    }, [habit.entries]);

    return (
        <div className="progress-overview-card">
            <h3 className="card-title">Progress Overview</h3>

            <div className="stats-list">
                <div className="stat-row">
                    <div className="icon-box green">
                        <FaCheck />
                    </div>
                    <span className="stat-text">
                        Days completed: <strong>{stats.total}</strong>
                    </span>
                </div>

                <div className="stat-row">
                    <div className="icon-box orange">
                        <FaFire />
                    </div>
                    <span className="stat-text">
                        Current streak: <strong>{stats.current} days</strong>
                    </span>
                </div>

                <div className="stat-row">
                    <div className="icon-box yellow">
                        <FaTrophy />
                    </div>
                    <span className="stat-text">
                        Best streak: <strong>{stats.best} days</strong>
                    </span>
                </div>
            </div>
        </div>
    );
}