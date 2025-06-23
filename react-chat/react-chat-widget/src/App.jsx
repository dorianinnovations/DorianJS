import React, { useState } from "react";
import axios from "axios";
import AIChatWidget from "./components/AIChatWidget";
import { createBot } from "./botCreation.js";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://dorianjs.onrender.com/ask"
    : "http://localhost:8080/ask";
      "https://localhost:5500/ask";
export default function ChatWithClaude() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (prompt) => {
    setLoading(true);
    setResponse("");

    const userMessage = { type: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Make a direct request to the backend
      const { data } = await axios.post(API_URL, { prompt });

      // Add AI response
      const aiMessage = { type: "ai", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
      setResponse(data.reply);
    } catch (err) {
      console.error("Error from backend:", err);
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
