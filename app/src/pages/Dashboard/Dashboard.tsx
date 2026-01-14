import { useState, useMemo } from 'react';
import { client } from '../../api/client';
import Card from '../../components/Card/Card';
import LogoCard from "../../components/LogoCard/LogoCard";
import MyHabits from '../../components/MyHabits/MyHabits';
import HabitDetails from '../../components/HabitDetails/HabitDetails';
import HabitModal from '../../components/HabitModal/HabitModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal';
import TodaysOverview from '../../components/TodaysOverview/TodaysOverview';
import CommunityInsights from '../../components/CommunityInsights/CommunityInsights';
import type { Habit } from '../../types';
import './Dashboard.scss';

export default function Dashboard() {
    const [allHabits, setAllHabits] = useState<Habit[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    // Zamiast useEffect do synchronizacji, używamy useMemo
    const selectedHabit = useMemo(() =>
            allHabits.find(h => h.id === selectedId) || null
        , [allHabits, selectedId]);

    const todayStr = new Date().toLocaleDateString('en-CA');

    // Generyczna funkcja do aktualizacji statusu (Check/Skip)
    const handleStatusUpdate = async (status: 'done' | 'skipped') => {
        if (!selectedId) return;
        try {
            await client(`/habits/${selectedId}/check`, {
                method: 'POST',
                body: { date: todayStr, status }
            });
            triggerRefresh();
        } catch (error) { console.error(error); }
    };

    const handleEditSubmit = async (data: Partial<Habit>) => {
        if (!selectedId) return;
        try {
            await client(`/habits/${selectedId}`, {
                method: 'PUT',
                body: data
            });
            setIsEditModalOpen(false);
            triggerRefresh();
        } catch (error) { console.error("Failed to update habit", error); }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedId) return;
        try {
            await client(`/habits/${selectedId}`, { method: 'DELETE' });
            setIsDeleteModalOpen(false);
            setSelectedId(null);
            triggerRefresh();
        } catch (error) { console.error("Failed to delete habit", error); }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                <div className="left-column">
                    <Card>
                        <MyHabits
                            onHabitSelect={(h) => setSelectedId(prev => prev === h.id ? null : h.id)}
                            selectedHabitId={selectedId}
                            refreshTrigger={refreshTrigger}
                            onHabitsFetched={setAllHabits}
                        />
                    </Card>
                </div>

                <div className="right-column">
                    <LogoCard />
                    <Card className="bottom-card">
                        {selectedHabit ? (
                            <HabitDetails
                                habit={selectedHabit}
                                onCheck={() => handleStatusUpdate('done')}
                                onSkip={() => handleStatusUpdate('skipped')}
                                onEdit={() => setIsEditModalOpen(true)}
                                onDelete={() => setIsDeleteModalOpen(true)}
                            />
                        ) : (
                            <div className="overview-wrapper">
                                <TodaysOverview habits={allHabits} />
                                <CommunityInsights />
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <HabitModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                initialData={selectedHabit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                habitName={selectedHabit?.name || ''}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}