// src/middlewares/validators.ts
// @ts-ignore
import { body, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

// Funkcja pomocnicza, która sprawdza, czy są błędy walidacji
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Jeśli są błędy, zwracamy 400 i listę błędów
        res.status(400).json({
            error: "Validation error",
            details: errors.array()
        });
        return;
    }
    next();
};

// Reguły dla Rejestracji
export const registerValidators = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),

    body("email")
        .trim()
        .isEmail().withMessage("Invalid email format"),

    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

// Reguły dla Logowania
export const loginValidators = [
    body("email")
        .trim()
        .isEmail().withMessage("Invalid email format"),

    body("password")
        .notEmpty().withMessage("Password is required"),
];