import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Phone, Mail } from 'lucide-react';
import { getMockedAIResponse, streamAIResponse } from '@/lib/ai';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

const HELP_TOPICS = [
  { label: 'How do I scan my first product?', category: 'Getting Started' },
  { label: 'How are suppliers ranked?', category: 'Suppliers' },
  { label: 'How is the recommended price calculated?', category: 'Pricing' },
  { label: 'How do I get more credits?', category: 'Billing' },
  { label: 'How do I add a product to Shopify?', category: 'Integration' },
  { label: 'My scan did not return results', category: 'Technical' },
  { label: 'What is the SEO description feature?', category: 'Features' },
  { label: 'How do I upgrade my plan?', category: 'Billing' },
];

const INITIAL: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'Welcome to Sourcingly Support. I can help with platform questions, scanning issues, supplier guidance, and general dropshipping advice. What do you need help with?',
  timestamp: new Date(),
};

const Support = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const aiMsgId = crypto.randomUUID();
    setMessages((p) => [
      ...p,
      { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() },
      { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() },
    ]);
    setInput('');
    setLoading(true);

    const history = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content });

    abortRef.current = new AbortController();

    try {
      await streamAIResponse(history, (chunk) => {
        setMessages((p) =>
          p.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + chunk } : m)),
        );
      }, abortRef.current.signal);
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        const reply = await getMockedAIResponse(content);
        setMessages((p) =>
          p.map((m) => (m.id === aiMsgId ? { ...m, content: m.content || reply } : m)),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role === 'user' || m.content !== '');
  const showTyping = loading && messages.some((m) => m.role === 'assistant' && m.content === '');

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Live Chat Support</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ask anything about Sourcingly or dropshipping — powered by real AI.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-5 overflow-y-auto shrink-0 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Common Questions</p>
            <div className="space-y-1.5">
              {HELP_TOPICS.map(({ label, category }) => (
                <button key={label} onClick={() => send(label)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                  <span className="block text-xs text-[#8B5CF6] font-medium mb-0.5">{category}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Direct Support</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={13} />support@sourcingly.io</div>
              <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={13} />+1 (800) 555-0190</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-xs text-emerald-600 font-medium">Mon–Fri 9am–6pm ET</span></div>
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {displayMessages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A3C9A8] to-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#A3C9A8] text-slate-800 rounded-tr-sm'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-sm',
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {showTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A3C9A8] to-[#8B5CF6] flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white/80 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask a question about Sourcingly..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40"
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="px-5 py-3 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 rounded-xl disabled:opacity-40 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
