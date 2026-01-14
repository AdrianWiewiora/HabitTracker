import request from "supertest";
// @ts-ignore
import app from "../src/server.js";
// @ts-ignore
import prisma from "../src/utils/prisma.js";

describe("Habit & Community Endpoints", () => {
    let token = "";
    let habitId = 0;

    const testUser = {
        username: "habit_tester",
        email: "habits@test.com",
        password: "password123"
    };

    beforeAll(async () => {
        // Czyszczenie bazy
        await prisma.note.deleteMany();
        await prisma.habitEntry.deleteMany();
        await prisma.habit.deleteMany();
        await prisma.user.deleteMany({ where: { email: testUser.email } });

        // Rejestracja i logowanie
        await request(app).post("/api/auth/register").send(testUser);
        const loginRes = await request(app).post("/api/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    // CRUD NAWYKÓW
    describe("Basic Habit CRUD", () => {
        it("should create a new habit", async () => {
            const res = await request(app)
                .post("/api/habits")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Drink Water",
                    description: "2 liters",
                    frequency: "Daily"
                });

            expect(res.statusCode).toEqual(201);
            habitId = res.body.id;
        });

        it("should get all habits", async () => {
            const res = await request(app)
                .get("/api/habits")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it("should update a habit", async () => {
            const res = await request(app)
                .put(`/api/habits/${habitId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Drink Lemon Water",
                    frequency: "Daily"
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.name).toEqual("Drink Lemon Water");
        });
    });

    // HECK-IN / ODHACZANIE
    describe("Habit Check-ins", () => {
        it("should check-in a habit (create entry)", async () => {
            const res = await request(app)
                .post(`/api/habits/${habitId}/check`)
                .set("Authorization", `Bearer ${token}`)
                .send({ status: "done" });

            expect([200, 201]).toContain(res.statusCode);
            expect(res.body.status).toEqual("done");
        });

        it("should update status if check-in already exists (idempotency)", async () => {
            // Próbujemy zmienić status na 'skipped' dla tego samego dnia
            const res = await request(app)
                .post(`/api/habits/${habitId}/check`)
                .set("Authorization", `Bearer ${token}`)
                .send({ status: "skipped" });

            expect(res.statusCode).toEqual(200); // 200 OK, bo to update
            expect(res.body.status).toEqual("skipped");
        });

        it("should uncheck a habit", async () => {
            const res = await request(app)
                .delete(`/api/habits/${habitId}/check`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
        });
    });

    // NOTATKI
    describe("Habit Notes", () => {
        it("should create/update a note for a habit", async () => {
            const noteContent = "This is hard but worth it.";

            const res = await request(app)
                .put(`/api/habits/${habitId}/note`)
                .set("Authorization", `Bearer ${token}`)
                .send({ content: noteContent });

            expect(res.statusCode).toEqual(200);
            expect(res.body.content).toEqual(noteContent);
            expect(res.body.habitId).toEqual(habitId);
        });
    });

    // SPOŁECZNOŚĆ
    describe("Community & Stats", () => {
        it("should return community stats", async () => {
            const res = await request(app)
                .get("/api/habits/community/stats")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("activeUsers");
            expect(res.body).toHaveProperty("topHabits");
            expect(Array.isArray(res.body.topHabits)).toBe(true);
        });

        it("should return popular public habits", async () => {
            const res = await request(app)
                .get("/api/habits/popular")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // SPRZĄTANIE
    describe("Cleanup", () => {
        it("should delete the habit", async () => {
            const res = await request(app)
                .delete(`/api/habits/${habitId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
        });
    });
});