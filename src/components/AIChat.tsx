"use client";

import { useState, useRef, useEffect } from "react";
import { User, Bot } from "lucide-react"; // 👈 Import icons

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface AIChatProps {
  initialMessage?: string;
  autoSend?: boolean;
}

export default function AIChat({ initialMessage = "", autoSend = false }: AIChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!initialMessage) return;
    const seed = truncate(initialMessage, 4000);
    setInput(seed);
    if (autoSend) {
      const t = setTimeout(() => {
        void sendMessage(seed);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialMessage, autoSend]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = { role: "user", content };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply: string = data?.choices?.[0]?.message?.content ?? "No response";

      setMessages((msgs) => [...msgs, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error: Unable to get a response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-120">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <Bot className="w-6 h-6 text-gray-500 flex-shrink-0" />
            )}
            <div
              className={`px-4 py-2 rounded-lg max-w-xs break-words shadow-md animate-fadeIn ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <User className="w-6 h-6 text-blue-500 flex-shrink-0" />
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start items-center gap-2">
            <Bot className="w-6 h-6 text-gray-500 flex-shrink-0" />
            <div className="bg-white px-4 py-2 rounded-lg shadow-md animate-fadeIn">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex p-4 border-t">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          Send
        </button>
      </div>

      {/* Tailwind animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 2px;
          background-color: #555;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function truncate(text: string, max = 4000): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 20)}\n\n[truncated…]`;
}
