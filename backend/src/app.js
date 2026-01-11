// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import stripeWebhookRouter from "./routes/stripeWebhookRoutes.js";

import config from "./config/config.js";

// import { startUserPurgeJob } from "./jobs/purgeDeletedUsers.js";

// startUserPurgeJob();


// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

// Error middleware
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// CORS setup
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = [
      config.FRONTEND_URL,
      "http://localhost:5000",
      "http://127.0.0.1:5173",
    ];
    return cb(null, allowed.includes(origin));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Global middlewares
app.use(helmet()); // security headers
app.use(express.json({ limit: "10kb" })); // prevent huge payload attacks
app.use(cookieParser()); // httpOnly cookies
app.use(compression()); // gzip compression
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api/payments/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookRouter);

// Basic health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API is running",
    environment: config.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/auth", authRoutes); // auth: login, register, refresh, logout
app.use("/api/users", userRoutes); // user management & profile
app.use("/api/admin", userRoutes); //admin stats dashboard
app.use("/api/providers", providerRoutes); // provider CRUD & listing
app.use("/api/campaigns", campaignRoutes); // campaigns CRUD & listing
app.use("/api/donations", donationRoutes); // donations CRUD & stats
app.use("/api/invoices", invoiceRoutes); // invoice generation & retrieval

// Error handling
app.use(notFound); // catch all unhandled routes
app.use(errorHandler); // centralized JSON error handler

export default app;

/* Stripe webhook handler — use express.raw + constructEvent + update Payment
Stripe requires the raw body for signature verification. In app.js */