import { useState, useRef, useEffect } from 'react';
import { Bot, X, Minus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMockedAIResponse, streamAIResponse } from '@/lib/ai';
import type { ChatMessage } from '@/types';

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'Hi, I am Sourcingly AI. I can help you find winning products, analyze suppliers, and grow your dropshipping business. What would you like to know?',
  timestamp: new Date(),
};

export const AIFloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const aiMsgId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: userContent, timestamp: new Date() },
      { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() },
    ]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: userContent });

    abortRef.current = new AbortController();

    try {
      await streamAIResponse(history, (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)),
        );
      }, abortRef.current.signal);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        const reply = await getMockedAIResponse(userContent);
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content || reply } : m)),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role === 'user' || m.content !== '');
  const showTyping = isLoading && messages.some((m) => m.role === 'assistant' && m.content === '');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && !isMinimized && (
        <div className="w-80 h-[480px] flex flex-col rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#A3C9A8]/20 to-violet-500/10 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A3C9A8] to-[#8B5CF6] flex items-center justify-center shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Sourcingly AI</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
              </div>
            </div>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
              <Minus size={14} />
            </button>
            <button onClick={() => { setIsOpen(false); abortRef.current?.abort(); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayMessages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#A3C9A8] text-slate-800 rounded-2xl rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-bl-sm',
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {showTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask Sourcingly AI..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40"
              />
              <button onClick={send} disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        id="ai-chat-btn"
        onClick={() => {
          if (isMinimized) { setIsMinimized(false); }
          else { setIsOpen((o) => !o); }
        }}
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A3C9A8] to-[#8B5CF6] shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-200"
        style={{ animation: 'float 3s ease-in-out infinite' }}
        title="Sourcingly AI"
      >
        <Bot size={24} className="text-white" />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950">
          <div className="w-full h-full bg-emerald-500 rounded-full animate-ping opacity-60" />
        </div>
      </button>
    </div>
  );
};
