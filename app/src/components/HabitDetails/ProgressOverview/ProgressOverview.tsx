import type {Habit} from '../../../types';
import { FaCheck, FaFire, FaTrophy } from 'react-icons/fa';

export default function ProgressOverview({ habit }: { habit: Habit }) {
    // Tu będzie logika liczenia
    const completedCount = habit.entries.filter(e => e.status === 'done').length;

    return (
        <div className="detail-card">
            <h3>Progress Overview</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaCheck color="#22c55e" />
                    <span>Days completed: {completedCount}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaFire color="#f97316" />
                    <span>Current streak: 0 days</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaTrophy color="#eab308" />
                    <span>Best streak: 0 days</span>
                </div>
            </div>
        </div>
    );
}