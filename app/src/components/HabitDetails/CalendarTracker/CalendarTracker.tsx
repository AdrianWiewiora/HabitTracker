import { useState, useMemo } from 'react';
import type { Habit } from '../../../types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CalendarTracker.scss';
import {getDateKey} from "../../../utils/dateHelpers.ts";

export default function CalendarTracker({ habit }: { habit: Habit }) {
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const entriesMap = useMemo(() => {
        const map: Record<string, string> = {};
        habit.entries.forEach(e => {
            map[getDateKey(new Date(e.date))] = e.status;
        });
        return map;
    }, [habit.entries]);

    const { calendarData, monthLabel } = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const startOffset = (firstDayIndex + 6) % 7;

        const days = [];
        for (let i = 0; i < startOffset; i++) {
            days.push({ dayNum: null, fullDate: null });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ dayNum: i, fullDate: new Date(year, month, i) });
        }

        return {
            calendarData: days,
            monthLabel: viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        };
    }, [viewDate]);

    const getStatusForDay = (date: Date) => {
        const key = getDateKey(date);
        const todayKey = getDateKey(new Date());
        const creationDate = new Date(habit.createdAt);
        creationDate.setHours(0, 0, 0, 0);

        if (date > new Date()) return 'future';
        if (date < creationDate) return 'before-creation';

        const status = entriesMap[key];
        if (status) return status;
        if (key === todayKey) return 'today-empty';

        return 'missing';
    };

    const handleMonthChange = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const createdAt = new Date(habit.createdAt);
    createdAt.setDate(1);
    createdAt.setHours(0,0,0,0);
    const maxViewDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    const canGoBack = viewDate.getTime() > createdAt.getTime();
    const canGoForward = viewDate.getTime() < maxViewDate.getTime();

    return (
        <div className="calendar-tracker-card">
            <div className="calendar-header">
                <button className="nav-btn" onClick={() => handleMonthChange(-1)} disabled={!canGoBack} style={{opacity: canGoBack ? 1 : 0}}>
                    <FaChevronLeft />
                </button>
                <span className="month-title">{monthLabel}</span>
                <button className="nav-btn" onClick={() => handleMonthChange(1)} disabled={!canGoForward} style={{opacity: canGoForward ? 1 : 0}}>
                    <FaChevronRight />
                </button>
            </div>

            <div className="calendar-grid">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="day-header">{d}</div>)}
                {calendarData.map((item, index) => (
                    <div
                        key={item.fullDate ? getDateKey(item.fullDate) : `empty-${index}`}
                        className={`day-box ${item.fullDate ? getStatusForDay(item.fullDate) : 'empty'}`}
                    >
                        {item.dayNum}
                    </div>
                ))}
            </div>
        </div>
    );
}