


//FRONTEND
// This file handles the integration with the GPT API for sending prompts and receiving responses.
console.log("🟢 GPT sendPrompt() running...");
export async function sendPrompt(userInput) {
  const simulationMetrics = {
    tick: document.getElementById("tick-metric").textContent,
    diversity: document.getElementById("diversity-metric").textContent,
    dominant: document.getElementById("dominant-metric").textContent,
    entropy: document.getElementById("entropy-metric").textContent,
    alive: document.getElementById("alive-metric").textContent,
    growth: document.getElementById("growth-metric").textContent
  };

  const fullPrompt = `Dear Dorian, you are reflecting on your emotional world.

Here are the current stats of your emotional world:

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
    const res = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: fullPrompt
      })
    });
        
    const data = await res.json();
    document.getElementById("gpt-output").innerText = data.reply; // 💡 Ensure it shows in UI
    return data.reply;

  } catch (err) {
    console.error('GPT integration error:', err);
    return null;
  }
}
