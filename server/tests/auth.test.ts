import request from "supertest";
// @ts-ignore
import app from "../src/server";
// @ts-ignore
import prisma from "../src/utils/prisma";

describe("Auth Endpoints", () => {

    // Ustawiamy dane testowe, których będziemy używać w wielu testach
    const testUser = {
        username: "auto_tester",
        email: "auto_test@example.com",
        password: "SuperSecretPassword123"
    };

    beforeAll(async () => {
        // Czyścimy bazę z ewentualnych śmieci po poprzednich testach
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: testUser.email },
                    { username: testUser.username },
                    { email: "duplicate_nick@example.com" } // czyscimy tez pomocniczy email
                ]
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    // === SEKCJA REJESTRACJI ===
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
                    username: "other_nick", // nick inny
                    email: testUser.email,  // ale email ten sam!
                    password: "Haslo123"
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty("error", "User with this email already exists");
        });

        it("should fail when registering with existing username", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: testUser.username,
                    email: "duplicate_nick@example.com",
                    password: "Haslo123"
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty("error", "Username already taken");
        });

        it("should fail when password is missing", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "incomplete_user",
                    email: "fail@example.com"
                });

            expect(res.statusCode).toEqual(400);
        });
    });
});