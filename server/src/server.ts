import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { initReminderScheduler } from "./utils/reminderScheduler.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const corsOptions = {
    origin: [
        'https://adrianwiewiora.github.io',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use("/api", routes);
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    initReminderScheduler();
});

export default app;