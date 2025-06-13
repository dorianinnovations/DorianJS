


//FRONTEND
// This file handles the integration with the GPT API for sending prompts and receiving responses.

export async function sendPrompt(userInput, simulationMetrics) {
  const fullPrompt = `
[Simulation Metrics]
Tick: ${metrics.tick}
Dominant Emotion: ${metrics.dominant}
Diversity: ${metrics.diversity}
Entropy: ${metrics.entropy}
Alive: ${metrics.alive}
Growth: ${metrics.growth}

[User Input]
${userInput}
`;
  try {
    const res = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: fullPrompt })
    });
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error('GPT integration error:', err);
    return null;
  }
}