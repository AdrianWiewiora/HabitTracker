import { useState, useEffect } from 'react';
import { client } from '../../../api/client';
import type { Habit } from '../../../types';
import './NotesReflections.scss';

export default function NotesReflections({ habit }: { habit: Habit }) {
    const [noteContent, setNoteContent] = useState('');
    // Zmieniamy boolean na string, żeby obsłużyć więcej stanów
    const [status, setStatus] = useState('Saved');

    useEffect(() => {
        if (habit.notes && habit.notes.length > 0) {
            setNoteContent(habit.notes[0].content || '');
        } else {
            setNoteContent('');
        }
        setStatus('Saved'); // Resetujemy status przy zmianie habitu
    }, [habit]);

    // Handler zmiany tekstu
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteContent(e.target.value);
        setStatus('Unsaved changes...'); // <--- Tu zmieniamy napis podczas pisania
    };

    const handleSave = async () => {
        // Opcjonalnie: nie zapisuj, jeśli status jest już 'Saved' (user tylko kliknął i wyszedł)
        if (status === 'Saved') return;

        setStatus('Saving...');
        try {
            await client(`/habits/${habit.id}/note`, {
                method: 'PUT',
                body: { content: noteContent }
            });
            // Opóźnienie dla efektu wizualnego (opcjonalne, ale przyjemne)
            setTimeout(() => setStatus('Saved'), 500);
        } catch (error) {
            console.error("Failed to save note", error);
            setStatus('Error saving');
        }
    };

    return (
        <div className="notes-reflections-card">
            <h3 className="card-title">Notes and Reflections</h3>

            <textarea
                className="notes-area"
                placeholder="Write your thoughts here..."
                value={noteContent}
                onChange={handleChange} // Podpinamy nasz nowy handler
                onBlur={handleSave}
                spellCheck={false}
            />

            {/* Wyświetlamy status. Dodajemy klasę dynamicznie dla kolorów */}
            <div className={`status-indicator ${status === 'Unsaved changes...' ? 'unsaved' : ''}`}>
                {status}
            </div>
        </div>
    );
}