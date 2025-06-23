// server.js - Fixed ESM version
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { createBot } from "./botCreation.js"; // Make sure this path is correct

// Load environment variables FIRST
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration - Development-friendly with strict production
// Base origins that are always allowed
const defaultAllowedOrigins = [
  "https://aidorian.com",
  "https://leafy-centaur-370c2f.netlify.app",
  "https://www.aidorian.com",
  "http://127.0.0.1:5500/",
  
];

// Allow additional origins from environment variable (comma separated)
const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

const allowedOrigins = [...defaultAllowedOrigins, ...envAllowedOrigins];

const isDevelopment = process.env.NODE_ENV !== "production";

const localOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  null, // Allow `null` origin for local file testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS Origin:", origin);

      if (!origin) return callback(null, true); // Allow non-browser requests

      // Allow all origins in development
      if (isDevelopment) {
        return callback(null, true);
      }

      // Allow if origin is in the allow list
      const fullAllowList = allowedOrigins.concat(localOrigins);
      if (fullAllowList.includes(origin)) {
        return callback(null, true);
      }

      // Reject without throwing to avoid 500 errors
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies and credentials
  })
);

// Provide a clear response when CORS blocks a request
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    console.error("CORS error:", err.message);
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

// Handle OPTIONS preflight requests
app.options("*", cors());

// Parse JSON requests
app.use(express.json());

// Check API key
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error(
    "⚠️ No API key found! Please set OPENROUTER_API_KEY in your .env file"
  );
}

// Create bot AFTER imports and configuration
const myBot = createBot();
console.log("🤖 Bot initialized successfully");

// Define API routes
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    console.log("Received prompt:", prompt.substring(0, 50) + "...");

    const reply = await myBot.sendMessage(prompt);
    console.log("Bot reply:", reply.substring(0, 50) + "...");
    return res.json({ reply });
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Dorian API is running" });
});

// Log request origin
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
