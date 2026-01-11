import request from "supertest";
import app from "../src/server.js";
import prisma from "../src/utils/prisma.js";

describe("Habit CRUD Endpoints", () => {
    let token = "";
    let habitId = 0; // Tu zapiszemy ID utworzonego nawyku, żeby go potem edytować/usunąć

    const testUser = {
        username: "habit_tester",
        email: "habits@test.com",
        password: "password123"
    };

    // 1. Setup: Czyścimy bazę i tworzymy użytkownika do testów
    beforeAll(async () => {
        // Najpierw usuwamy wpisy zależne (nawyki), potem użytkowników
        await prisma.habitEntry.deleteMany();
        await prisma.habit.deleteMany();
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });

        // Rejestrujemy usera
        await request(app).post("/api/auth/register").send(testUser);

        // Logujemy się po token
        const loginRes = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });

        token = loginRes.body.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    // === CREATE (Tworzenie) ===
    describe("POST /api/habits", () => {
        it("should create a new habit", async () => {
            const res = await request(app)
                .post("/api/habits")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Drink Water",
                    description: "2 liters a day",
                    frequency: "Daily"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body.name).toEqual("Drink Water");
            expect(res.body.frequency).toEqual("Daily");

            // Zapisujemy ID do zmiennej, żeby użyć w kolejnych testach!
            habitId = res.body.id;
        });

        it("should fail validation if name is missing", async () => {
            const res = await request(app)
                .post("/api/habits")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    frequency: "Daily"
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    // === READ (Pobieranie) ===
    describe("GET /api/habits", () => {
        it("should get all habits for logged user", async () => {
            const res = await request(app)
                .get("/api/habits")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].name).toEqual("Drink Water");
        });
    });

    // === UPDATE (Edycja) ===
    describe("PUT /api/habits/:id", () => {
        it("should update an existing habit", async () => {
            const res = await request(app)
                .put(`/api/habits/${habitId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Drink MORE Water",
                    frequency: "Daily",
                    description: "3 liters now!"
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual("Drink MORE Water");
            expect(res.body.description).toEqual("3 liters now!");
        });

        it("should fail when updating non-existing habit", async () => {
            const res = await request(app)
                .put(`/api/habits/999999`) // Nieistniejące ID
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Ghost Habit",
                    frequency: "Daily"
                });

            expect(res.statusCode).toEqual(404);
        });
    });

    // === DELETE (Usuwanie) ===
    describe("DELETE /api/habits/:id", () => {
        it("should delete the habit", async () => {
            const res = await request(app)
                .delete(`/api/habits/${habitId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual("Habit deleted");
        });

        it("should return 404 when deleting already deleted habit", async () => {
            const res = await request(app)
                .delete(`/api/habits/${habitId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
        });
    });

    // === CHECK-IN (Postępy) ===
    describe("Habit Progress Tracking", () => {
        let newHabitId = 0;

        // Tworzymy świeży nawyk do testowania odhaczania
        beforeAll(async () => {
            const res = await request(app)
                .post("/api/habits")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Daily Pushups", frequency: "Daily" });
            newHabitId = res.body.id;
        });

        it("should check-in a habit for today", async () => {
            const res = await request(app)
                .post(`/api/habits/${newHabitId}/check`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual("done");
        });

        it("should not allow double check-in for the same day", async () => {
            const res = await request(app)
                .post(`/api/habits/${newHabitId}/check`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(409); // Conflict
        });

        it("should uncheck (undo) a habit", async () => {
            const res = await request(app)
                .delete(`/api/habits/${newHabitId}/check`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
        });

        it("should handle check-in with specific date", async () => {
            const pastDate = "2023-01-01";
            const res = await request(app)
                .post(`/api/habits/${newHabitId}/check`)
                .set("Authorization", `Bearer ${token}`)
                .send({ date: pastDate });

            expect(res.statusCode).toEqual(201);
            expect(res.body.date).toContain("2023-01-01"); // Prisma zwraca ISO string
        });
    });
});