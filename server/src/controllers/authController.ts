import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {createUser, findUserByEmail, findUserById, findUserByUsername, updateUserPushSubscription, updateUser} from "../services/userService.js";
import {AuthRequest} from "../middlewares/authMiddleware.js";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user: { id: number; username: string }) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "14d" }
    );
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;
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

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await createUser({
            username,
            email,
            passwordHash,
        });

        const token = generateToken(newUser);

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

        const user = await findUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        if (!user.passwordHash) {
            res.status(401).json({ error: "This account is connected to Google. Please use 'Sign in with Google'." });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = generateToken(user);

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

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }

        const user = await findUserById(req.user.id);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const savePushSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { subscription } = req.body;

        if (!subscription) {
            res.status(400).json({ error: "Missing subscription data" });
            return;
        }

        // Przekazujemy zadanie do serwisu
        await updateUserPushSubscription(userId, subscription);

        res.status(200).json({ message: "Push subscription saved successfully" });
    } catch (error) {
        console.error("Save push subscription error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { username } = req.body;

        if (!username || username.trim() === "") {
            res.status(400).json({ error: "Username cannot be empty" });
            return;
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
            res.status(400).json({ error: "Username already taken" });
            return;
        }
        await updateUser(userId, { username });

        res.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ error: "No credential provided" });
            return;
        }

        // 1. Weryfikacja tokenu w Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: "Invalid Google token" });
            return;
        }

        const { email, sub: googleId, name } = payload;

        // 2. Sprawdzamy, czy użytkownik już istnieje
        let user = await findUserByEmail(email);

        if (!user) {
            // Użytkownika nie ma w bazie -> TWORZYMY NOWE KONTO
            // Generujemy unikalny nick z imienia z Google (usuwamy spacje, dodajemy losowe cyfry dla unikalności)
            const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
            const uniqueUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;

            user = await createUser({
                email,
                username: uniqueUsername,
                googleId,
                // passwordHash zostaje puste (null), bo użytkownik loguje się przez Google
            });
        } else if (!user.googleId) {
            // Użytkownik istnieje (np. zarejestrował się klasycznie),
            // ale teraz użył Google. Łączymy konta:
            await updateUser(user.id, { googleId });
        }

        // 3. Generujemy NASZ WŁASNY token dla frontendu
        const token = generateToken(user);

        res.json({
            message: "Google login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ error: "Google authentication failed" });
    }
};