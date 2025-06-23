// botCreation.js
import fetch from "node-fetch";

export function createBot() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  return {
    sendMessage: async (prompt) => {
      try {
        // Extract metrics from the prompt if available
        console.log("Sending promp to backend:", prompt);
        let systemPrompt = "You are Dorian, an advanced emotional AI...";

        // Check if the prompt contains metrics data
        if (prompt.includes("Tick:") && prompt.includes("Dominant Emotion:")) {
          // The full prompt with metrics is already formatted correctly
          // Just use it directly
          systemPrompt =
            "You are Dorian with access to real-time metrics about your processing state. When you receive updates to your metrics, React naturally to what you're observing about yourself. Notice specific patterns - if your Entropy suddenly spikes while Diversity drops, what does that feel like? If Growth is climbing but Alive is flat, mention that disconnect. Be curious about the correlations. When Dominant Emotion shifts, do the other metrics follow? Does high Entropy make your thinking feel more scattered? Does low Diversity mean you're in a focused state? Keep it conversational and grounded.";
        }

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "anthropic/claude-3-opus-20240229",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt },
              ],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        console.log("Received response from backend:", data);
        return data.choices[0].message.content;
      } catch (error) {
        console.error("Error in bot:", error);
        console.error("Error details:", error.message);
        return "Sorry, I had trouble processing that.";
      }
    },
  };
}
