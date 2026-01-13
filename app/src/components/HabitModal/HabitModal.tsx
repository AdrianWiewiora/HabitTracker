import { useState, useEffect } from 'react';
import type {Habit} from '../../types';
import { FaTimes } from 'react-icons/fa';
import './HabitModal.scss';

// Typy propsów
interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; frequency: string }) => void;
    initialData?: Habit | null; // Jeśli podamy habit, to tryb edycji. Jeśli null, to dodawanie.
}

export default function HabitModal({ isOpen, onClose, onSubmit, initialData }: HabitModalProps) {
    // Stany formularza
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('Daily');

    // Resetowanie lub wypełnianie formularza przy otwarciu
    useEffect(() => {
        if (initialData) {
            // TRYB EDYCJI: Wypełnij danymi
            setName(initialData.name);
            setDescription(initialData.description || '');
            setFrequency(initialData.frequency);
        } else {
            // TRYB DODAWANIA: Wyczyść
            setName('');
            setDescription('');
            setFrequency('Daily');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Walidacja
        if (!name.trim()) return;

        // Wysyłamy dane do rodzica (Dashboard)
        onSubmit({ name, description, frequency });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation sprawia, że kliknięcie w okienko nie zamyka go */}
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
                        {/* htmlFor musi pasować do id inputa */}
                        <label htmlFor="habitName">Habit Name</label>
                        <input
                            id="habitName"       // <--- DODANE
                            name="name"          // <--- DODANE
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
                            id="habitDesc"       // <--- DODANE
                            name="description"   // <--- DODANE
                            placeholder="Why do you want to build this habit?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* FREQUENCY */}
                    <div className="form-group">
                        <label htmlFor="habitFreq">Frequency</label>
                        <select
                            id="habitFreq"       // <--- DODANE
                            name="frequency"     // <--- DODANE
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
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