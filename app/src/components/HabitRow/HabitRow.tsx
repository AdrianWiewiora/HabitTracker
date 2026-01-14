import type { Habit } from '../../types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './HabitRow.scss';

interface HabitRowProps {
    habit: Habit;
    onCheck: (habit: Habit) => void;
    onSkip: (habit: Habit) => void;
    isSelected?: boolean;
    onClick?: () => void;
}

// Funkcja pomocnicza: Zamienia datę na string "YYYY-MM-DD" w czasie LOKALNYM
const getDateKey = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-CA');
};

export default function HabitRow({ habit, onCheck, onSkip, isSelected, onClick }: HabitRowProps) {
    const today = new Date();
    const todayKey = getDateKey(today);

    const todayEntry = habit.entries.find(e => getDateKey(e.date) === todayKey);

    const isDone = todayEntry?.status === 'done';
    const isSkipped = todayEntry?.status === 'skipped';

    const renderRecentDays = () => {
        const squares = [];
        const createdAt = new Date(habit.createdAt);
        createdAt.setHours(0,0,0,0);

        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dTime = new Date(d);
            dTime.setHours(0,0,0,0);
            if (dTime.getTime() < createdAt.getTime()) {
                squares.push(<div key={i} className="status-box placeholder"></div>);
                continue;
            }

            const currentDayKey = getDateKey(d);
            const entry = habit.entries.find(e => getDateKey(e.date) === currentDayKey);
            const isTodayLoop = i === 0;

            let className = 'status-box';

            if (entry?.status === 'done') {
                className += ' green';
            } else if (entry?.status === 'skipped') {
                className += ' red';
            } else {
                // Brak wpisu
                if (isTodayLoop) {
                    className += ' orange'; // Dziś (oczekujący)
                } else {
                    className += ' red'; // Przeszłość (niezrobione)
                }
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