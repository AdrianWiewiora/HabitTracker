import request from "supertest";
// @ts-ignore
import app from "../src/server";
// @ts-ignore
import prisma from "../src/utils/prisma";

describe("Auth Endpoints", () => {
    const testUser = {
        username: "auto_tester",
        email: "auto_test@example.com",
        password: "SuperSecretPassword123"
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: testUser.email },
                    { username: testUser.username },
                    { email: "duplicate_nick@example.com" }
                ]
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("token");
            expect(res.body.user.username).toEqual(testUser.username);
        });

        it("should fail when registering with existing email", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "other_nick",
                    email: testUser.email,
                    password: "Haslo123"
                });

            expect(res.statusCode).toEqual(409);
        });
    });

    describe("POST /api/auth/login", () => {
        it("should login successfully", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("token");
        });

        it("should fail with wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "WrongPassword123"
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe("GET /api/auth/me", () => {
        let token = "";

        beforeAll(async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            token = res.body.token;
        });

        it("should return user profile with createdAt date", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.user.email).toEqual(testUser.email);
            // Sprawdzamy czy zwracamy datę (to dodaliśmy w kontrolerze)
            expect(res.body.user).toHaveProperty("createdAt");
        });

        it("should deny access without token", async () => {
            const res = await request(app).get("/api/auth/me");
            expect(res.statusCode).toEqual(401);
        });
    });
});