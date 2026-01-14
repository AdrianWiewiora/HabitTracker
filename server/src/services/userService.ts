import prisma from "../utils/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

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