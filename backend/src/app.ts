import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

export default app;
