import { useState, useRef, useEffect } from "react";
import API from "./API.tsx";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your TaskFlow assistant. How can I help you?" },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await API.post("chat/", { message: userMessage.text });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.assistant.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "AI is currently unavailable. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
          color: "#fff",
          fontSize: "22px",
          cursor: "pointer",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
        }}
        aria-label="Toggle chat"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            width: "340px",
            height: "480px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: "14px" }}>TaskFlow AI</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>
                {loading ? "Typing..." : "Online"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "9px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 2px 14px"
                        : "14px 14px 14px 2px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)"
                        : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1f2937",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    border: msg.role === "assistant" ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "9px 13px",
                    borderRadius: "14px 14px 14px 2px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  <span style={{ letterSpacing: "2px" }}>•••</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                background: "#f9fafb",
                color: "#1f2937",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "none",
                background:
                  loading || !message.trim()
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                color: "#fff",
                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                flexShrink: 0,
              }}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}