import { useEffect, useState } from 'react';
import { client } from '../../api/client';
import './CommunityInsights.scss';

interface CommunityData {
    activeUsers: number;
    newHabits: number;
    topHabits: { name: string; count: number }[];
}

export default function CommunityInsights() {
    const [stats, setStats] = useState<CommunityData | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await client<CommunityData>('/habits/community/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch community stats", error);
            }
        };

        fetchStats();
    }, []);

    if (!stats) return <div className="community-insights loading">Loading community data...</div>;

    return (
        <div className="community-insights">
            <h2 className="section-title">Community Insight</h2>

            <div className="cards-grid">

                {/* KARTA 1: TOP HABITS */}
                <div className="insight-card top-habits">
                    <h3>Top habits this week</h3>
                    <div className="list">
                        {stats.topHabits.length > 0 ? (
                            stats.topHabits.map((habit, index) => (
                                <div key={habit.name} className="habit-item">
                                    <div className="rank">#{index + 1}</div>
                                    <div className="name">{habit.name}</div>
                                    <div className="count">{habit.count} users</div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No data yet.</p>
                        )}
                    </div>
                </div>

                {/* KARTA 2: STATS */}
                <div className="insight-card stats-box">
                    <h3>Community stats</h3>

                    <div className="stat-row">
                        <span className="label">Active users today:</span>
                        <span className="value">{stats.activeUsers}</span>
                    </div>

                    <div className="stat-row">
                        <span className="label">New Habits this week:</span>
                        <span className="value">{stats.newHabits}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}