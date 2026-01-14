import { useEffect, useState, useMemo } from 'react';
import type { Habit } from '../../types';
import { getDateKey, calculateCurrentStreak } from '../../utils/dateHelpers';
import { FaCheckCircle, FaFire, FaDumbbell } from 'react-icons/fa';
import './TodaysOverview.scss';

interface TodaysOverviewProps {
    habits: Habit[];
}

export default function TodaysOverview({ habits }: TodaysOverviewProps) {
    const [quote, setQuote] = useState<string>('Loading affirmation...');

    // 1. Pobieranie cytatu z API
    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://www.affirmations.dev/'));
                const data = await response.json();
                setQuote(data.affirmation);
            } catch (error) {
                console.error("Failed to fetch quote:", error);
                setQuote("Discipline is choosing what you want most over what you want now.");
            }
        };
        fetchQuote();
    }, []);

    // 2. Obliczanie metryk
    const metrics = useMemo(() => {
        const todayKey = getDateKey(new Date());
        const totalHabits = habits.length;

        if (totalHabits === 0) {
            return { completed: '0/0', streaks: 0, consistency: '0%' };
        }

        // A. Completed Habits Today (Liczba nawyków zrobionych dziś)
        const completedTodayCount = habits.filter(h =>
            h.entries.some(e => getDateKey(e.date) === todayKey && e.status === 'done')
        ).length;

        // B. Active Streaks (NOWA LOGIKA: Dziś zrobione + Streak >= 2)
        const activeStreaksCount = habits.filter(h => {
            // 1. Sprawdzamy, czy nawyk jest zrobiony DZIŚ
            const isDoneToday = h.entries.some(e =>
                getDateKey(e.date) === todayKey && e.status === 'done'
            );

            // 2. Pobieramy długość passy
            const streak = calculateCurrentStreak(h);

            // 3. Warunek: Musi być zrobiony dzisiaj ORAZ passa musi wynosić min. 2 dni.
            // (Skoro jest zrobiony dziś i streak to min. 2, oznacza to, że wczoraj też był zrobiony).
            return isDoneToday && streak >= 2;
        }).length;

        // C. Consistency (Dzisiejsze ukończone / wszystkie)
        const consistencyPercent = Math.round((completedTodayCount / totalHabits) * 100);

        return {
            completed: `${completedTodayCount}/${totalHabits}`,
            streaks: activeStreaksCount,
            consistency: `${consistencyPercent}%`
        };

    }, [habits]);

    return (
        <div className="todays-overview-container">
            <h1 className="title-section">Today’s overview</h1>

            <div className="overview-grid">
                {/* LEWA KARTA - METRYKI */}
                <div className="overview-card metrics-card">
                    <div className="metric-row">
                        <span className="label">Completed Habits</span>
                        <span className="value">{metrics.completed}</span>
                        <FaCheckCircle className="icon green" />
                    </div>
                    <div className="metric-row">
                        <span className="label">Active Streaks</span>
                        <span className="value">{metrics.streaks}</span>
                        <FaFire className="icon orange" />
                    </div>
                    <div className="metric-row">
                        <span className="label">Consistency</span>
                        <span className="value">{metrics.consistency}</span>
                        <FaDumbbell className="icon yellow" />
                    </div>
                </div>

                {/* PRAWA KARTA - CYTAT */}
                <div className="overview-card quote-card">
                    <p>"{quote}"</p>
                </div>
            </div>
        </div>
    );
}