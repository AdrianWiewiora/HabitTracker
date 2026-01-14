import { useMemo } from 'react';
import type { Habit } from '../../../types';
import { FaCheck, FaFire, FaTrophy } from 'react-icons/fa';
import { normalizeDate, getDaysDiff } from '../../../utils/dateHelpers';
import './ProgressOverview.scss';

export default function ProgressOverview({ habit }: { habit: Habit }) {

    const stats = useMemo(() => {
        // 1. Pobieramy tylko ZROBIONE (done) do obliczeń passy
        const doneEntries = habit.entries
            .filter(e => e.status === 'done')
            .map(e => normalizeDate(e.date).getTime())
            .sort((a, b) => b - a); // od najnowszych

        const uniqueDates = Array.from(new Set(doneEntries));
        const totalCompleted = uniqueDates.length;

        // 2. Sprawdzamy czy DZIŚ jest SKIPPED (Pominięte)
        const todayDateObj = normalizeDate(new Date());
        const today = todayDateObj.getTime();

        const isSkippedToday = habit.entries.some(e =>
            normalizeDate(e.date).getTime() === today && e.status === 'skipped'
        );

        // --- OBLICZANIE BEST STREAK ---
        let bestStreak = 0;
        if (totalCompleted > 0) {
            let tempStreak = 1;
            bestStreak = 1;
            const sortedAsc = [...uniqueDates].sort((a, b) => a - b);

            for (let i = 0; i < sortedAsc.length - 1; i++) {
                const diff = getDaysDiff(sortedAsc[i+1], sortedAsc[i]);
                if (diff === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
                if (tempStreak > bestStreak) bestStreak = tempStreak;
            }
        }

        // --- OBLICZANIE CURRENT STREAK ---
        let currentStreak = 0;
        const yesterday = today - (24 * 60 * 60 * 1000);

        if (uniqueDates.length > 0) {
            const lastEntryDate = uniqueDates[0]; // Najnowsza data "done"
            const isStreakAlive =
                (lastEntryDate === today) ||
                (lastEntryDate === yesterday && !isSkippedToday);

            if (isStreakAlive) {
                currentStreak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const diff = getDaysDiff(uniqueDates[i], uniqueDates[i+1]);
                    if (diff === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            } else {
                currentStreak = 0;
            }
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