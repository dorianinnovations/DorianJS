import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 🔥 Wait for DOM to load
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chat-root");
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    console.error("❌ No #chat-root element found in the DOM.");
  }
});

export default App;