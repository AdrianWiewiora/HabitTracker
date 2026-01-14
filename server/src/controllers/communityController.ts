import type { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { getCommunityStatsService } from "../services/communityService.js"; // Importujesz nową funkcję

export const getCommunityStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const stats = await getCommunityStatsService();
        res.json(stats);
    } catch (error) {
        console.error("Community stats error:", error);
        res.status(500).json({ error: "Server error" });
    }
};