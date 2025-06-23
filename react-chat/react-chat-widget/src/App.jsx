import React, { useState } from "react";
import axios from "axios";
import AIChatWidget from "./components/AIChatWidget";

export default function ChatWithClaude() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (prompt) => {
    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post("http://localhost:8000/ask", {
        prompt,
      });

      const reply =
        res.data?.reply || res.data?.content || "No response from Claude";

      setResponse(reply);
    } catch (err) {
      console.error("Error from Claude:", err);
      setResponse("Error talking to Claude.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIChatWidget onSubmit={sendMessage} response={response} loading={loading} />
  );
}
