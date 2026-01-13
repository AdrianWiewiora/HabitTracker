import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByUsername } from "../models/userModel.js";
import {AuthRequest} from "../middlewares/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Sprawdzenie duplikatów
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            res.status(409).json({ error: "User with this email already exists" });
            return;
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            res.status(409).json({ error: "Username already taken" });
            return;
        }

        // Hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Zapis do bazy
        const newUser = await createUser({
            username,
            email,
            passwordHash,
        });

        // Generowanie tokena (opcjonalne przy rejestracji, ale wygodne)
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: "14d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Znalezienie użytkownika
        const user = await findUserByEmail(email);
        if (!user) {
            // Ze względów bezpieczeństwa nie piszemy "User not found", tylko ogólnie "Invalid credentials"
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        // 3. Sprawdzenie hasła (porównanie tekstu z hashem w bazie)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        // 4. Generowanie tokena (tak samo jak przy rejestracji)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "14d" }
        );

        // 5. Sukces
        res.json({
            message: "Registration successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }


        res.json({
            user: {
                id: req.user.id,
                username: req.user.username
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};