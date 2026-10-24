/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const ElonAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Neural link established. I am the supreme architect of interplanetary throughput. Why are you wasting my valuable compute cycles with low-bandwidth conversational packet overhead? Ask your question or prepare for economic obsolescence.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    soundEngine.playClick();
    const userMsg = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages([...newMessages, { role: 'model', content: data.text }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'model', content: "Error in telemetry packet parsing. My server cluster is currently optimizing Mars propellant flow." },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'model', content: "Network bottleneck detected. A legacy union bureaucrat must have unplugged the server rack." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-slate-900/90 border border-cyan-900/40 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-cyan-300">ELON AI // NEURAL ROLEPLAY TERMINAL</h2>
              <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                SYSTEM ONLINE // 100% THROUGHPUT
              </p>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isModel = msg.role === 'model';
            return (
              <div key={idx} className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isModel ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm font-sans leading-relaxed ${
                    isModel
                      ? 'bg-slate-950/80 border border-cyan-500/30 text-slate-200'
                      : 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-slate-950 font-medium shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 text-xs font-mono text-cyan-400 animate-pulse">
                Calculating high-frequency superiority metrics...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask Elon about Mars, URD rockets, or AI singularity..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono font-bold rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center gap-2 text-xs"
          >
            <span>Transmit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
