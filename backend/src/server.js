// src/server.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import config from "./config/config.js";
import app from "./app.js"; // ← This is your Express app (already created in app.js)
import cors from "cors";

// No need to re-create app or add middleware here — it's already in app.js

const PORT = config.PORT || 5000;

// Connect DB then start server
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect DB:", err.message);
    process.exit(1);
  }
})();



// // app.js or server.js
// const express = require('express');
// const { authenticatedLndGrpc, getWalletInfo } = require('ln-service');
// const app = express();

// // Initialize LND connection
// const lnd = authenticatedLndGrpc({
//   cert: process.env.LND_CERT_BASE64,
//   macaroon: process.env.LND_MACAROON_BASE64,
//   socket: process.env.LND_SOCKET || 'localhost:10009'
// }).lnd;

// // Test connection on startup
// (async () => {
//   try {
//     const info = await getWalletInfo({ lnd });
//     console.log('✅ LND connected successfully!');
//     console.log('Node public key:', info.public_key);
//     console.log('Node alias:', info.alias);
//   } catch (error) {
//     console.error('❌ Failed to connect to LND:', error.message);
//   }
// })();

// // API endpoint to get node info
// // app.get('/api/lightning/node-info', async (req, res) => {
// //   try {
// //     const info = await getWalletInfo({ lnd });
// //     res.json({
// //       publicKey: info.public_key,
// //       alias: info.alias,
// //       version: info.version
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // API endpoint to create invoice
// app.post('/api/lightning/invoice', async (req, res) => {
//   try {
//     const { createInvoice } = require('ln-service');
//     const { amount, description } = req.body;
    
//     const invoice = await createInvoice({
//       lnd,
//       tokens: amount,
//       description: description
//     });
    
//     res.json({
//       paymentRequest: invoice.request,
//       paymentHash: invoice.id,
//       expiresAt: invoice.expires_at
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });