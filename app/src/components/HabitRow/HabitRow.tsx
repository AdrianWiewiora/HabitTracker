import type { Habit } from '../../types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './HabitRow.scss';
import {useMemo} from "react";
import {getDateKey} from "../../utils/dateHelpers.ts";

interface HabitRowProps {
    habit: Habit;
    onCheck: (habit: Habit) => void;
    onSkip: (habit: Habit) => void;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function HabitRow({ habit, onCheck, onSkip, isSelected, onClick }: HabitRowProps) {
    const today = new Date();
    const todayKey = getDateKey(today);

    const entriesMap = useMemo(() => {
        const map: Record<string, string> = {};
        habit.entries.forEach(e => {
            map[getDateKey(e.date)] = e.status;
        });
        return map;
    }, [habit.entries]);

    const todayStatus = entriesMap[todayKey];
    const isDone = todayStatus === 'done';
    const isSkipped = todayStatus === 'skipped';

    const renderRecentDays = () => {
        const squares = [];
        const createdAtTime = new Date(habit.createdAt).setHours(0,0,0,0);

        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const currentDayKey = getDateKey(d);
            const dTime = d.setHours(0,0,0,0);

            if (dTime < createdAtTime) {
                squares.push(<div key={i} className="status-box placeholder"></div>);
                continue;
            }

            const status = entriesMap[currentDayKey];
            const isTodayLoop = i === 0;

            let className = 'status-box';
            if (status === 'done') className += ' green';
            else if (status === 'skipped') className += ' red';
            else {
                className += isTodayLoop ? ' orange' : ' red';
            }

            squares.push(<div key={i} className={className} title={currentDayKey}></div>);
        }
        return squares;
    };

    return (
        <div
            className={`habit-row ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="col-name" title={habit.name}>{habit.name}</div>

            <div className="col-recent">
                {renderRecentDays()}
            </div>

            <div className="col-today">
                <button
                    className={`icon-btn check ${isDone ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onCheck(habit);
                    }}
                >
                    <FaCheck size={22}/>
                </button>

                <button
                    className={`icon-btn cross ${isSkipped ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSkip(habit);
                    }}
                >
                    <FaTimes size={22}/>
                </button>
            </div>
        </div>
    );
}