import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaTimes, FaUser } from 'react-icons/fa';
import { client } from '../../api/client';
import './SettingsModal.scss';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, logout } = useAuth();
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newUsername === user?.username) {
            setError('This is already your current nickname!');
            return;
        }

        try {
            await client('/auth/update-profile', {
                body: { username: newUsername },
                method: 'PUT'
            });

            setMessage('Nickname updated successfully! Please log in again.');
            setTimeout(() => {
                onClose();
                logout();
            }, 2000);

        } catch (err: any) {
            setError(err.error || 'Failed to update nickname');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Account Settings</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSave}>
                    {message && <div className="status-message success">{message}</div>}
                    {error && <div className="status-message error">{error}</div>}

                    <div className="form-group">
                        <label><FaUser /> Change Nickname</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new nickname"
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}