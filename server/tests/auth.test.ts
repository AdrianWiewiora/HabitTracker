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

    // === 2. TESTY LOGOWANIA (To dodaliśmy!) ===
    describe("POST /api/auth/login", () => {

        it("should login successfully with correct credentials", async () => {
            // Logujemy się na użytkownika utworzonego w pierwszym teście
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toEqual(200); // 200 OK
            expect(res.body).toHaveProperty("token"); // Musi być token JWT
            expect(res.body.user.email).toEqual(testUser.email);
        });

        it("should fail with wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "WrongPassword123" // Złe hasło
                });

            expect(res.statusCode).toEqual(401); // 401 Unauthorized
            expect(res.body).toHaveProperty("error", "Invalid email or password");
        });

        it("should fail when user does not exist", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "ghost@example.com", // Ten mail nie istnieje
                    password: "password"
                });

            expect(res.statusCode).toEqual(401);
        });

        it("should fail when input is missing", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email
                    // brak hasła
                });

            expect(res.statusCode).toEqual(400); // 400 Bad Request
        });
    });

    // === 3. TESTY PROFILU I MIDDLEWARE ===
    describe("GET /api/auth/me", () => {
        let token = "";

        // Najpierw musimy się zalogować, żeby zdobyć token do testów
        beforeAll(async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            token = res.body.token;
        });

        it("should access protected route with valid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`); // Dodajemy nagłówek

            expect(res.statusCode).toEqual(200);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user.username).toEqual(testUser.username);
        });

        it("should deny access without token", async () => {
            const res = await request(app)
                .get("/api/auth/me");

            // Bez nagłówka Authorization powinno być 401
            expect(res.statusCode).toEqual(401);
        });

        it("should deny access with invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid_token_123");

            expect(res.statusCode).toEqual(403); // 403 Forbidden
        });
    });
});