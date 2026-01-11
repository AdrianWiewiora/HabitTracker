import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByUsername } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // 1. Walidacja: czy pola są wypełnione
        if (!username || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        // 2. Sprawdzenie duplikatów
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

        // 3. Hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Zapis do bazy
        const newUser = await createUser({
            username,
            email,
            passwordHash,
        });

        // 5. Generowanie tokena (opcjonalne przy rejestracji, ale wygodne)
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: "1h" }
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

        // 1. Walidacja danych wejściowych
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        // 2. Znalezienie użytkownika
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
            { expiresIn: "1h" }
        );

        // 5. Sukces
        res.json({
            message: "Login successful",
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