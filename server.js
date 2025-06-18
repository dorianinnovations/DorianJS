// server.js (ESM-compatible version)
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import { loadMemory, saveMemory } from './memory.js';

// Load environment variables
dotenv.config();
const apiKey = process.env.OPENROUTER_API_KEY;

console.log("API KEY loaded:", !!apiKey);

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  'https://yourdomain.com',                    //  custom domain
  'https://leafy-centaur-370c2f.netlify.app',  //  Netlify deploy preview
  'http://localhost:3000'                      //  local dev (optional)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(cors());
app.use(bodyParser.json());
app.use('/media', express.static('media'));
app.get('/memory', (req, res) => {
  try {
    const memory = loadMemory();
    res.json(memory);
  } catch (error) {
    console.error('Error loading memory:', error);
    res.status(500).json({ error: 'Failed to load memory' });
  }
});

// Add static file serving for your frontend
app.use(express.static('.')); // Serve your HTML/CSS/JS files


// Consistent response parsing for both agents
const parseResponse = (response) => {
  return response.data?.choices?.[0]?.message?.content 
    || response.data?.choices?.[0]?.text 
    || 'No reply.';
};

// 🧠 Agent 1 Route
app.post('/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet:beta',
        messages: [
          {
            role: 'system',
            content:
              "You are Agent 1. The only things you know are your current emotions and what you can derive of what they express about your current state.",
          },
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
      }
    );

  // Agent 1 has fallback parsing, Agent 2 doesn't
  const reply = parseResponse(response);


  const memory = loadMemory();
  memory.emotionLog.push({
    tick: memory.meta.currentTick,
    reflection: reply,
     
});

app.get('/healthz', (req, res) => {
  res.send('OK');
});


memory.meta.currentTick += 1;
saveMemory(memory);

    res.json({ reply });
  } catch (error) {
    console.error('Agent 1 API Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Agent 1' });
  }
});





// 🤖 Agent 2 Route
app.post('/ask-second', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet:beta',
        messages: [
          {
            role: 'system',
            content:
              "You are Agent 2. The only things you know are your impressions of Agent 1's expressions, and what these impressions evoke in you.",
          },
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
      }
    );
console.log("Agent 2 response:", response.data);
    const reply = parseResponse(response);
    res.json({ reply });
  } catch (error) {
    console.error('Agent 2 API Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Agent 2' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ server running at http://localhost:${PORT}`);
});
