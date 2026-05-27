import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import habitRoutes from "./habits/habit.routes";
import completionRoutes from "./completions/completion.routes";
import orderRoutes from "./order/order.routes";
import preferencesRoutes from "./preferences/preferences.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use("/api/habits", habitRoutes);
app.use("/api/completions", completionRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/preferences", preferencesRoutes);

app.use(errorHandler);

export default app;
