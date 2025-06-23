import React, { useState } from "react";
import axios from "axios";
import AIChatWidget from "./components/AIChatWidget";
import { createBot } from "./botCreation.js";
const bot = createBot();
export default function ChatWithClaude() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (prompt) => {
    setLoading(true);
    setResponse("");

    const userMessage = { type: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Use the bot's sendMessage method to get the AI response
      const reply = await bot.sendMessage(prompt);

      // Add AI response
      const aiMessage = { type: "ai", content: reply };
      setMessages((prev) => [...prev, aiMessage]);
      setResponse(reply);
    } catch (err) {
      console.error("Error from bot:", err);
      const errorMessage = {
        type: "ai",
        content: "Sorry, I'm sleeping right now",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setResponse("Error talking to Dorian.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIChatWidget
      onSubmit={sendMessage}
      response={response}
      loading={loading}
    />
  );
}
