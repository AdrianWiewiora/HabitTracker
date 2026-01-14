import { useState, useEffect } from 'react';
import { client } from '../../../api/client';
import type { Habit } from '../../../types';
import './NotesReflections.scss';

export default function NotesReflections({ habit }: { habit: Habit }) {
    const [noteContent, setNoteContent] = useState('');
    const [status, setStatus] = useState('Saved');

    useEffect(() => {
        if (habit.notes && habit.notes.length > 0) {
            setNoteContent(habit.notes[0].content || '');
        } else {
            setNoteContent('');
        }
        setStatus('Saved');
    }, [habit]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteContent(e.target.value);
        setStatus('Unsaved changes...');
    };

    const handleSave = async () => {
        if (status === 'Saved') return;

        setStatus('Saving...');
        try {
            await client(`/habits/${habit.id}/note`, {
                method: 'PUT',
                body: { content: noteContent }
            });
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
                onChange={handleChange}
                onBlur={handleSave}
                spellCheck={false}
            />

            <div className={`status-indicator ${status === 'Unsaved changes...' ? 'unsaved' : ''}`}>
                {status}
            </div>
        </div>
    );
}