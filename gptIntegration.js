


//FRONTEND
// This file handles the integration with the GPT API for sending prompts and receiving responses.
export async function sendUserPrompt(userInput){
  return await sendPrompt(userInput, false);
}
  export async function sendAutoReflection(systemInput) {
    return await sendPrompt(systemInput, true);

  }
  console.log("🟢 LLM API ONLINE...");

export async function sendPrompt(userInput) {
  const simulationMetrics = {
    tick: document.getElementById("tick-metric").textContent,
    diversity: document.getElementById("diversity-metric").textContent,
    dominant: document.getElementById("dominant-metric").textContent,
    entropy: document.getElementById("entropy-metric").textContent,
    alive: document.getElementById("alive-metric").textContent,
    growth: document.getElementById("growth-metric").textContent
  };

  const fullPrompt = `Use the given metrics to create a narrative of what is occuring in an environment with  emotional metrics. Keep your response concise, informative, and observatory. Allow your thoughts to compound.

Here are the current stats of your environment:

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
    const res = await fetch('https://dorianjs.onrender.com/ask', {

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
