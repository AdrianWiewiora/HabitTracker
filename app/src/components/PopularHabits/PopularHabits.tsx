import { useEffect, useState, useCallback } from 'react';
import { client } from '../../api/client';
import { FaPlus } from 'react-icons/fa';
import './PopularHabits.scss';

interface PopularHabit {
    id: number;
    name: string;
    description: string;
    frequency: string;
    usersCount: number;
}

interface PopularHabitsProps {
    onHabitAdded: () => void;
}

export default function PopularHabits({ onHabitAdded }: PopularHabitsProps) {
    const [popularHabits, setPopularHabits] = useState<PopularHabit[]>([]);

    const fetchPopular = useCallback(async () => {
        try {
            const data = await client<PopularHabit[]>('/habits/popular');
            setPopularHabits(data);
        } catch (error) {
            console.error("Failed to fetch popular habits", error);
        }
    }, []);

    //  przy starcie
    useEffect(() => {
        fetchPopular();
    }, [fetchPopular]);

    const handleAddPopular = async (habit: PopularHabit) => {
        try {
            await client('/habits', {
                body: {
                    name: habit.name,
                    description: habit.description,
                    frequency: habit.frequency
                }
            });

            onHabitAdded();
            await fetchPopular();
        } catch (error) {
            console.error("Error adding popular habit", error);
        }
    };

    return (
        <div className="popular-habits-content">
            <h2 className="title-section">Popular Habits</h2>

            <div className="popular-list">
                {popularHabits.map(habit => (
                    <div key={habit.id} className="popular-row">
                        <div className="info-group">
                            <span className="habit-name">{habit.name}</span>
                            <span className="users-count">{habit.usersCount} users</span>
                        </div>

                        <div className="actions">
                            <button
                                className="icon-btn add"
                                onClick={() => handleAddPopular(habit)}
                                title="Add to My Habits"
                            >
                                <FaPlus size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}