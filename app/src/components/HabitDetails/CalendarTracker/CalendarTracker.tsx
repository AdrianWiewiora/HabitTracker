import { useState, useMemo } from 'react';
import type { Habit } from '../../../types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CalendarTracker.scss';

// Helper: Format YYYY-MM-DD
const getDateKey = (d: Date) => {
    return d.toLocaleDateString('en-CA');
};

export default function CalendarTracker({ habit }: { habit: Habit }) {
    // Stan: Aktualnie wyświetlany miesiąc (zawsze ustawiony na 1. dzień miesiąca)
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Data utworzenia nawyku (znormalizowana do początku miesiąca dla łatwego porównania)
    const createdAt = new Date(habit.createdAt);
    createdAt.setDate(1);
    createdAt.setHours(0,0,0,0);
    const today = new Date();
    const maxViewDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    maxViewDate.setHours(0,0,0,0);

    // --- LOGIKA KALENDARZA ---
    const calendarData = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth(); // 0-11

        // 1. Ilość dni w miesiącu
        // trik: dzień "0" następnego miesiąca to ostatni dzień obecnego
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 2. Pierwszy dzień tygodnia (0=Niedz, 1=Pon, ... 6=Sob)
        const firstDayIndex = new Date(year, month, 1).getDay();

        // 3. Konwersja na układ: Pon=0, ... Niedz=6
        // JS: Niedz(0), Pon(1)...
        // My chcemy: Pon(0)... Niedz(6)
        // Wzór: (day + 6) % 7
        const startOffset = (firstDayIndex + 6) % 7;

        // 4. Generowanie tablicy dni
        const days = [];

        // A. Puste kratki na początku (padding)
        for (let i = 0; i < startOffset; i++) {
            days.push({ dayNum: null, fullDate: null });
        }

        // B. Właściwe dni
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            days.push({ dayNum: i, fullDate: d });
        }

        return days;
    }, [viewDate]);

    // --- NAWIGACJA ---
    const handlePrevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // 1. Blokada wstecz (data stworzenia)
    const canGoBack = viewDate.getTime() > createdAt.getTime();

    // 2. Blokada w przód (nie dalej niż maxViewDate)
    const canGoForward = viewDate.getTime() < maxViewDate.getTime();

    // --- STATUS DNIA ---
    const getStatusForDay = (date: Date) => {
        const key = getDateKey(date);
        const todayKey = getDateKey(new Date());

        // 1. Normalizacja daty stworzenia (ustawiamy godzinę na 00:00:00)
        // Dzięki temu 12 stycznia 00:00 nie będzie mniejsze niż 12 stycznia 17:00
        const creationDate = new Date(habit.createdAt);
        creationDate.setHours(0, 0, 0, 0);

        const isToday = key === todayKey;

        if (date > new Date()) return 'future';

        // 2. Porównujemy z naszą znormalizowaną datą
        if (date < creationDate) return 'before-creation';

        // Szukamy wpisu
        const entry = habit.entries.find(e => getDateKey(new Date(e.date)) === key);

        if (entry) return entry.status; // 'done' lub 'skipped' (Czerwony/Zielony)

        if (isToday) return 'today-empty'; // Pomarańczowa ramka

        // 3. Jeśli to przeszłość i nie ma wpisu -> zwróć 'missing'
        // W CSS 'missing' jest szare. Jeśli chcesz czerwone, zmień w SCSS lub zwróć tu 'skipped'.
        return 'missing';
    };

    // Formatowanie nagłówka (np. "October 2023")
    const monthLabel = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="calendar-tracker-card">
            <div className="calendar-header">
                {/* Przycisk WSTECZ */}
                <button
                    className="nav-btn"
                    onClick={handlePrevMonth}
                    disabled={!canGoBack}
                    style={{opacity: canGoBack ? 1 : 0}}
                >
                    <FaChevronLeft />
                </button>

                <span className="month-title">{monthLabel}</span>

                {/* Przycisk DALEJ */}
                <button
                    className="nav-btn"
                    onClick={handleNextMonth}
                    disabled={!canGoForward}
                    style={{opacity: canGoForward ? 1 : 0}}
                >
                    <FaChevronRight />
                </button>
            </div>

            <div className="calendar-grid">
                <div className="day-header">Mo</div>
                <div className="day-header">Tu</div>
                <div className="day-header">We</div>
                <div className="day-header">Th</div>
                <div className="day-header">Fr</div>
                <div className="day-header">Sa</div>
                <div className="day-header">Su</div>

                {calendarData.map((item, index) => {
                    if (!item.fullDate) {
                        return <div key={`empty-${index}`} className="day-box empty"></div>;
                    }

                    const status = getStatusForDay(item.fullDate);

                    return (
                        <div
                            key={getDateKey(item.fullDate)}
                            className={`day-box ${status}`}
                            title={getDateKey(item.fullDate)}
                        >
                            {item.dayNum}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}