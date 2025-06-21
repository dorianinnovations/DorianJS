// server.js - Fixed ESM version
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createBot } from './botCreation.js'; // Make sure this path is correct

// Load environment variables FIRST
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration - Development-friendly with strict production
const allowedOrigins = [
  'https://www.aidorian.com',
  'https://leafy-centaur-370c2f.netlify.app', 
  'https://dorianjs.onrender.com'
];

const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: function(origin, callback) {
    // Allow all in development mode or when origin is undefined (server-to-server)
    if (isDevelopment || !origin) {
      return callback(null, true);
    }
    
    // Check allowed origins in production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Parse JSON requests
app.use(express.json());

// Check API key
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("⚠️ No API key found! Please set OPENROUTER_API_KEY in your .env file");
}

// Create bot AFTER imports and configuration
const myBot = createBot();

// Define API routes
app.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }
    
    console.log("Received prompt:", prompt.substring(0, 50) + "...");
    
    const reply = await myBot.sendMessage(prompt);
    return res.json({ reply });
    
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Dorian API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});