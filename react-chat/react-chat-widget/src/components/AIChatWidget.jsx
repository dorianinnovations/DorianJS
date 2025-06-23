import React, { useState } from "react";
import { Search, Lightbulb, MoreHorizontal, Send, Plus } from "lucide-react";

export default function AIChatWidget({ onSubmit, response }) {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input); // delegate submission to parent
      setInput("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {isExpanded && (
        <div
          style={{
            marginBottom: "16px",
            width: "360px",
            height: "600px",
            backgroundColor: "#111111",
            borderRadius: "16px",
            boxShadow: "0 35px 80px -20px rgba(0, 0, 0, 0.7)",
            border: "1px solid #1f1f1f",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(6px)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ color: "#f5f5f5", margin: 0, fontWeight: 500 }}>Dorian</h3>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                color: "#888",
                background: "transparent",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Chat body */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              color: "#bbb",
              fontSize: "13px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            Ask me something you're curious about. I'm here to help.
          </div>

          {/* Input */}
          <div style={{ padding: "16px", borderTop: "1px solid #2c2c2c" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ask anything..."
                style={{
                  flex: 1,
                  backgroundColor: "#191919",
                  color: "#f0f0f0",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "14px",
                  border: "1px solid #303030",
                  outline: "none",
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: "#222",
                  border: "1px solid #333",
                  color: "#eee",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "16px",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
          border: "1px solid #242424",
          cursor: "pointer",
          width: isExpanded ? "64px" : "340px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: isExpanded ? "0" : "0 20px",
          transition: "all 0.3s ease",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          backdropFilter: "blur(6px)",
          color: "#f5f5f5",
        }}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {!isExpanded ? (
          <>
            <input
              type="text"
              placeholder="Ask anything"
              onFocus={() => setIsExpanded(true)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#bbb",
                fontSize: "16px",
                fontWeight: "500",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginLeft: "16px",
                color: "#888",
              }}
            >
              <Plus size={28} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={18} />
                <span style={{ fontSize: "13px" }}>Canvas</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lightbulb size={18} />
                <span style={{ fontSize: "13px" }}>Think</span>
              </div>
              <MoreHorizontal size={18} />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
