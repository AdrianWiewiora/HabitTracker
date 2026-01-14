import type { Habit } from '../../types';
import HabitInfo from './HabitInfo/HabitInfo';
import ProgressOverview from './ProgressOverview/ProgressOverview';
import CalendarTracker from './CalendarTracker/CalendarTracker';
import NotesReflections from './NotesReflections/NotesReflections';
import './HabitDetails.scss';

interface HabitDetailsProps {
    habit: Habit;
    onCheck: () => void;
    onSkip: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function HabitDetails({ habit, onCheck, onSkip, onEdit, onDelete }: HabitDetailsProps) {
    return (
        <div className="habit-details-container">
            <h1 className="title-64">Habit Details</h1>
            <div className="details-grid">
                <HabitInfo
                    habit={habit}
                    onCheck={onCheck}
                    onSkip={onSkip}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />

                <ProgressOverview habit={habit} />
                <CalendarTracker habit={habit} />
                <NotesReflections habit={habit} />
            </div>
        </div>
    );
}