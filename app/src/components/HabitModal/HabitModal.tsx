import { useState, useEffect } from 'react';
import type {Habit} from '../../types';
import { FaTimes } from 'react-icons/fa';
import './HabitModal.scss';

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

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
            setFrequency(initialData.frequency || 'Daily');
        } else {
            setName('');
            setDescription('');
            setFrequency('Daily');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onSubmit({
            name,
            description,
            frequency
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