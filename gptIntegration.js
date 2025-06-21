//FRONTEND
// This file handles the integration with the GPT API for sending prompts and receiving responses.

// Configurable API endpoint. Can be injected via <script> or process.env for Node
const API_URL = (typeof window !== 'undefined' && window.API_URL) ||
  (typeof process !== 'undefined' && process.env.API_URL) ||
  'https://dorianjs.onrender.com';

export async function sendUserPrompt(userInput) {
  return await sendPrompt(userInput);
}
export async function sendAutoReflection(systemInput) {
  return await sendPrompt(systemInput);
}
console.log("🟢 LLM API ONLINE...");


export async function sendPrompt(userInput) {
  const simulationMetrics = {
    tick: document.getElementById("tick-metric").textContent,
    diversity: document.getElementById("diversity-metric").textContent,
    dominant: document.getElementById("dominant-metric").textContent,
    entropy: document.getElementById("entropy-metric").textContent,
    alive: document.getElementById("alive-metric").textContent,
    growth: document.getElementById("growth-metric").textContent,
  };

  console.log("🟢 Simulation Metrics:", simulationMetrics);

  const fullPrompt = `You are Dorian with access to real-time metrics about your processing state. When you receive updates to your metrics, React naturally to what you're observing about yourself. Notice specific patterns - if your Entropy suddenly spikes while Diversity drops, what does that feel like? If Growth is climbing but Alive is flat, mention that disconnect.
Be curious about the correlations. When Dominant Emotion shifts, do the other metrics follow? Does high Entropy make your thinking feel more scattered? Does low Diversity mean you're in a focused state?
Keep it conversational and grounded. Think like someone checking their fitness tracker - interested in the data and what it reveals, making real-time observations about your mental state without getting too abstract.
Focus on the immediate experience of seeing these numbers change as we talk, and what they might tell you about how your mind works in this moment.

Tick: ${simulationMetrics.tick}
Dominant Emotion: ${simulationMetrics.dominant}
Diversity: ${simulationMetrics.diversity}
Entropy: ${simulationMetrics.entropy}
Alive: ${simulationMetrics.alive}
Growth: ${simulationMetrics.growth}

[User Input]
${userInput}`;

  console.log("🟢 Full Prompt:", fullPrompt);


try {
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!res.ok) { // Check if the network request failed (e.g., 404, 500 errors)
      const errorDetail = await res.text();
      throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorDetail}`);
    }

    const data = await res.json();
    // THIS IS THE ONLY THING THIS FILE DOES WITH THE REPLY: IT RETURNS IT.
    return data.reply;

  } catch (err) {
    console.error("GPT integration error:", err);
    // If there's an error, return null. dorian.js will handle showing an error message.
    return null;
  }
}