import type {Habit} from '../../../types';
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import './HabitInfo.scss';

interface HabitInfoProps {
    habit: Habit;
    onCheck?: () => void;
    onSkip?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function HabitInfo({ habit, onCheck, onSkip, onEdit, onDelete }: HabitInfoProps) {
    return (
        <div className="habit-info-card">
            <div className="info-grid">
                <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{habit.name}</span>
                </div>
                <div className="info-row">
                    <span className="label">Frequency:</span>
                    <span className="value">{habit.frequency}</span>
                </div>
                <div className="info-row">
                    <span className="label">Reminder:</span>
                    <span className="value">-</span>
                </div>
                <div className="info-row">
                    <span className="label">Description:</span>
                    <span className="value desc">{habit.description || '-'}</span>
                </div>
            </div>

            <div className="actions-grid">
                <button className="action-btn done" onClick={onCheck}>
                    <span>Done</span>
                    <FaCheck />
                </button>

                <button className="action-btn not-done" onClick={onSkip}>
                    <span>Not Done</span>
                    <FaTimes />
                </button>

                <button className="action-btn edit" onClick={onEdit}>
                    <span>Edit</span>
                    <FaEdit />
                </button>

                <button className="action-btn delete" onClick={onDelete}>
                    <span>Delete</span>
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}