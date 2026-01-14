// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Rozszerzamy typ Request, żebyśmy mogli zapisać w nim dane z tokena
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 1. Pobieramy nagłówek Authorization
    const authHeader = req.headers["authorization"];

    // Nagłówek wygląda tak: "Bearer <token>", więc bierzemy drugi człon
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: "Invalid or expired token" });
            return;
        }

        // Jeśli token jest OK, zapisujemy dane usera w obiekcie req
        req.user = user as { id: number; username: string };
        next();
    });
};