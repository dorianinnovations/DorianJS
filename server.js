const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/ask', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-sonnet:beta', // Claude model via OpenRouter
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || 'No reply.';
    res.json({ reply });
  } catch (error) {
    console.error('Claude API Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Claude' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Claude server running at http://localhost:${PORT}`);
});
