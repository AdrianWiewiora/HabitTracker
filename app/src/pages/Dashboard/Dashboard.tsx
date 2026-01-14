import { useState } from 'react';
import { client } from '../../api/client';
import Card from '../../components/Card/Card';
import LogoCard from "../../components/LogoCard/LogoCard";
import MyHabits from '../../components/MyHabits/MyHabits';
import HabitDetails from '../../components/HabitDetails/HabitDetails';
import HabitModal from '../../components/HabitModal/HabitModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal/ConfirmDeleteModal';
import TodaysOverview from '../../components/TodaysOverview/TodaysOverview';
import type {Habit} from '../../types';
import './Dashboard.scss';

export default function Dashboard() {
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [allHabits, setAllHabits] = useState<Habit[]>([]);
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);


    // 1. Check/Skip z poziomu Detali
    const handleCheckFromDetails = async () => {
        if (!selectedHabit) return;
        try {
            await client(`/habits/${selectedHabit.id}/check`, {
                method: 'POST',
                body: { date: new Date().toLocaleDateString('en-CA'), status: 'done' }
            });
            triggerRefresh();
        } catch (error) { console.error(error); }
    };

    const handleSkipFromDetails = async () => {
        if (!selectedHabit) return;
        try {
            await client(`/habits/${selectedHabit.id}/check`, {
                method: 'POST',
                body: { date: new Date().toLocaleDateString('en-CA'), status: 'skipped' }
            });
            triggerRefresh();
        } catch (error) { console.error(error); }
    };

    // 2. Edycja
    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (data: { name: string, description: string, frequency: string }) => {
        if (!selectedHabit) return;
        try {
            await client(`/habits/${selectedHabit.id}`, {
                method: 'PUT', // Zakładam, że masz endpoint PUT /habits/:id
                body: data
            });
            setIsEditModalOpen(false);
            triggerRefresh();
            setSelectedHabit({ ...selectedHabit, ...data } as Habit);
        } catch (error) {
            console.error("Failed to update habit", error);
        }
    };

    // 3. Usuwanie
    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedHabit) return;
        try {
            await client(`/habits/${selectedHabit.id}`, { method: 'DELETE' }); // Zakładam endpoint DELETE
            setIsDeleteModalOpen(false);
            setSelectedHabit(null);
            triggerRefresh();
        } catch (error) {
            console.error("Failed to delete habit", error);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                {/* LEWA KOLUMNA */}
                <div className="left-column">
                    <Card>
                        <MyHabits
                            onHabitSelect={(h) => setSelectedHabit(prev => prev?.id === h.id ? null : h)}
                            selectedHabitId={selectedHabit?.id || null}
                            refreshTrigger={refreshTrigger}
                            onHabitsFetched={setAllHabits}
                        />
                    </Card>
                </div>

                {/* PRAWA KOLUMNA */}
                <div className="right-column">
                    <LogoCard />
                    <Card className="bottom-card">
                        {selectedHabit ? (
                            <HabitDetails
                                habit={selectedHabit}
                                onCheck={handleCheckFromDetails}
                                onSkip={handleSkipFromDetails}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        ) : (
                            <TodaysOverview habits={allHabits} />
                        )}
                    </Card>
                </div>
            </div>

            {/* MODALE GLOBALNE */}

            {/* Modal Edycji */}
            <HabitModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                initialData={selectedHabit} // Przekazujemy dane do edycji
            />

            {/* Modal Usuwania */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                habitName={selectedHabit?.name || ''}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}