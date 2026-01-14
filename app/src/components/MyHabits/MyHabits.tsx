import { useEffect, useState } from 'react';
import { client } from '../../api/client';
import type {Habit} from '../../types';
import HabitRow from '../HabitRow/HabitRow';
import HabitModal from '../HabitModal/HabitModal';
import './MyHabits.scss';
import PopularHabits from "../PopularHabits/PopularHabits.tsx";

interface MyHabitsProps {
    onHabitSelect: (habit: Habit) => void;
    selectedHabitId: number | null;
    refreshTrigger?: number;
    onHabitsFetched?: (habits: Habit[]) => void;
}

export default function MyHabits({ onHabitSelect, selectedHabitId, refreshTrigger, onHabitsFetched }: MyHabitsProps) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

    const fetchHabits = async () => {
        try {
            const data = await client<Habit[]>('/habits');
            setHabits(data);
            if (onHabitsFetched) onHabitsFetched(data);
        } catch (error) {
            console.error("Failed to fetch habits", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, [refreshTrigger]);

    const handleCheck = async (habit: Habit) => {
        try {
            await client(`/habits/${habit.id}/check`, {
                method: 'POST',
                body: {
                    date: new Date().toLocaleDateString('en-CA'),
                    status: 'done'
                }
            });
            fetchHabits();
        } catch (error) { console.error(error); }
    };

    const handleSkip = async (habit: Habit) => {
        try {
            await client(`/habits/${habit.id}/check`, {
                method: 'POST',
                body: {
                    date: new Date().toLocaleDateString('en-CA'),
                    status: 'skipped'
                }
            });
            fetchHabits();
        } catch (error) { console.error(error); }
    };

    const openAddModal = () => {
        setSelectedHabit(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedHabit(null);
    };

    const handleSaveHabit = async (habitData: Partial<Habit>) => {
        try {
            await client('/habits', { body: { ...habitData } });
            closeModal();
            fetchHabits();
        } catch (error) {
            console.error("Error saving habit:", error);
        }
    };

    const handlePopularAdded = () => {
        fetchHabits();
    };

    return (
        <div className="my-habits-content">
            <h1 className="title-64">My Habits</h1>

            <div className="headers-48">
                <span>Name</span>
                <span className="col-center">Recent Days</span>
                <span className="col-right">Today</span>
            </div>

            <div className="habits-list">
                {loading ? (
                    <p className="empty-msg">Loading...</p>
                ) : habits.length === 0 ? (
                    <p className="empty-msg">No habits yet.</p>
                ) : (
                    habits.map(habit => (
                        <HabitRow
                            key={habit.id}
                            habit={habit}
                            onCheck={handleCheck}
                            onSkip={handleSkip}
                            isSelected={habit.id === selectedHabitId}
                            onClick={() => onHabitSelect(habit)}
                        />
                    ))
                )}
            </div>

            <button className="add-btn" onClick={openAddModal}>
                Add new habit
            </button>
            <PopularHabits onHabitAdded={handlePopularAdded} />

            <HabitModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSaveHabit}
                initialData={selectedHabit}
            />
        </div>
    );
}