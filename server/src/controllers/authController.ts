import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {createUser, findUserByEmail, findUserById, findUserByUsername} from "../services/userService.js";
import {AuthRequest} from "../middlewares/authMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

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