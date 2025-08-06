'use client';

import { useState } from 'react';

export default function DeepseekChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response';
      setMessages((msgs) => [...msgs, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4 space-y-2 max-h-80 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className="px-2 py-1 rounded bg-gray-200 inline-block">{m.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="border px-4 py-1"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}

