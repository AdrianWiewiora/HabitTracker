import prisma from "../utils/prisma.js";

export const getCommunityStatsService = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    // 1. Aktywni użytkownicy
    const activeUsersCount = await prisma.habitEntry.groupBy({
        by: ['userId'],
        where: { date: { gte: today } },
    });

    // 2. Nowe nawyki
    const newHabits = await prisma.habit.count({
        where: { createdAt: { gte: oneWeekAgo } }
    });

    // 3. Top nawyki (logika przeniesiona z kontrolera)
    const entries = await prisma.habitEntry.findMany({
        where: {
            date: { gte: oneWeekAgo },
            status: 'done'
        },
        include: {
            habit: { select: { name: true } }
        }
    });

    const habitUsersMap: Record<string, Set<number>> = {};
    entries.forEach(entry => {
        const name = entry.habit.name.trim();
        if (!habitUsersMap[name]) habitUsersMap[name] = new Set();
        habitUsersMap[name].add(entry.userId);
    });

    const topHabits = Object.entries(habitUsersMap)
        .map(([name, userSet]) => ({
            name,
            count: userSet.size
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return {
        activeUsers: activeUsersCount.length,
        newHabits,
        topHabits
    };
};