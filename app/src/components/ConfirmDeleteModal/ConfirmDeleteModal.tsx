import './ConfirmDeleteModal.scss';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    habitName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, habitName, onClose, onConfirm }: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-header">Delete Habit?</h3>
                <p>Are you sure you want to delete <strong>{habitName}</strong>?</p>
                <p className="warning">This action cannot be undone.</p>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="delete-confirm-btn not-done" onClick={onConfirm}>Yes, Delete</button>
                </div>
            </div>
        </div>
    );
}