import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client";

export const createUser = async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({
        data,
    });
};

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {email},
    });
};

export const findUserByUsername = async (username: string) => {
    return prisma.user.findUnique({
        where: {username},
    });
};

export const findUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
    });
};

export const updateUserPushSubscription = async (userId: number, subscription: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: subscription },
    });
};

export const updateUser = async (userId: number, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({
        where: { id: userId },
        data,
    });
};