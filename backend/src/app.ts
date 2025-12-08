import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import campaignRoutes from "./routes/campaign";
import donationRoutes from "./routes/donation";
import providerRoutes from "./routes/provider";
import invoiceRoutes from "./routes/invoice";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/campaigns", campaignRoutes);
app.use("/donations", donationRoutes);
app.use("/providers", providerRoutes);
app.use("/invoices", invoiceRoutes);

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(errorHandler);

export default app;
