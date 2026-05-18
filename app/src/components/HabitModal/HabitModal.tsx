import { useState, useEffect } from 'react';
import type {Habit} from '../../types';
import { FaTimes } from 'react-icons/fa';
import './HabitModal.scss';
import { notificationService } from '../../utils/notificationService';

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Habit>) => void;
    initialData?: Habit | null;
}

export default function HabitModal({ isOpen, onClose, onSubmit, initialData }: HabitModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<Habit['frequency']>('Daily');

    const [hasReminder, setHasReminder] = useState(!!initialData?.reminderTime);
    const [reminderTime, setReminderTime] = useState(initialData?.reminderTime || "12:00");

    const handleReminderToggle = async (checked: boolean) => {
        if (checked) {
            const isGranted = await notificationService.requestPermission();

            if (isGranted) {
                setHasReminder(true);
                await notificationService.subscribeUserToPush();
            } else {
                alert("To enable reminders, you must allow notifications in your browser settings!");
                setHasReminder(false);
            }
        } else {
            setHasReminder(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setFrequency(initialData.frequency || 'Daily');

            if (initialData.reminderTime) {
                setHasReminder(true);
                setReminderTime(initialData.reminderTime);
            } else {
                setHasReminder(false);
                setReminderTime('12:00');
            }
        } else {
            setName('');
            setDescription('');
            setFrequency('Daily');
            setHasReminder(false);
            setReminderTime('12:00');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSubmit({
            name,
            description,
            frequency,
            reminderTime: hasReminder ? reminderTime : null
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>{initialData ? 'Edit Habit' : 'Add New Habit'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* NAME */}
                    <div className="form-group">
                        <label htmlFor="habitName">Habit Name</label>
                        <input
                            id="habitName"
                            name="name"
                            type="text"
                            placeholder="e.g. Read 10 pages"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label htmlFor="habitDesc">Description <small>(optional)</small></label>
                        <textarea
                            id="habitDesc"
                            name="description"
                            placeholder="Why do you want to build this habit?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* FREQUENCY - ZABLOKOWANE */}
                    <div className="form-group">
                        <label htmlFor="habitFreq">Frequency</label>
                        <select
                            id="habitFreq"
                            name="frequency"
                            value="Daily"
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            onChange={() => {}}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                        <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                            Currently only daily tracking is supported.
                        </small>
                    </div>

                    {/* === SEKCJA PRZYPOMNIENIA (NOWOŚĆ) === */}
                    <div className="form-group reminder-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={hasReminder}
                                onChange={(e) => handleReminderToggle(e.target.checked)}
                            />
                            <span>Enable Daily Reminder</span>
                        </label>

                        {hasReminder && (
                            <div className="time-picker-wrapper">
                                <label htmlFor="reminderTime">Select Time:</label>
                                <input
                                    id="reminderTime"
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    required={hasReminder}
                                />
                            </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            {initialData ? 'Save Changes' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}