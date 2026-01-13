import type { Habit } from '../../types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './HabitRow.scss';

interface HabitRowProps {
    habit: Habit;
    onCheck: (habit: Habit) => void;
    onSkip: (habit: Habit) => void;
}

// Funkcja pomocnicza: Zamienia datę na string "YYYY-MM-DD" w czasie LOKALNYM
const getDateKey = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-CA');
};

export default function HabitRow({ habit, onCheck, onSkip }: HabitRowProps) {
    const today = new Date();
    // Ważne: operujemy na dacie lokalnej w przeglądarce
    const todayKey = getDateKey(today);

    // Znajdź dzisiejszy wpis po kluczu daty
    const todayEntry = habit.entries.find(e => getDateKey(e.date) === todayKey);

    const isDone = todayEntry?.status === 'done';
    const isSkipped = todayEntry?.status === 'skipped';

    const renderRecentDays = () => {
        const squares = [];

        // Data stworzenia nawyku - musimy ją znormalizować do północy,
        // żeby porównywać same dni, a nie godziny.
        const createdAt = new Date(habit.createdAt);
        createdAt.setHours(0,0,0,0);

        // Pętla: 4 dni temu ... do Dzisiaj (0)
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today); // Kopia dzisiejszej daty
            d.setDate(d.getDate() - i); // Cofamy się o 'i' dni

            // Normalizujemy dzień pętli do północy dla pewności porównania
            const dTime = new Date(d);
            dTime.setHours(0,0,0,0);

            // Jeśli dzień z pętli jest wcześniejszy niż dzień stworzenia nawyku
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
        <div className="habit-row">
            <div className="col-name" title={habit.name}>{habit.name}</div>

            <div className="col-recent">
                {renderRecentDays()}
            </div>

            <div className="col-today">
                <button
                    className={`icon-btn check ${isDone ? 'active' : ''}`}
                    onClick={() => onCheck(habit)}
                >
                    <FaCheck size={22}/>
                </button>

                <button
                    className={`icon-btn cross ${isSkipped ? 'active' : ''}`}
                    onClick={() => onSkip(habit)}
                >
                    <FaTimes size={22}/>
                </button>
            </div>
        </div>
    );
}