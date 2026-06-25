'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { chatbotApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm your food discovery assistant. Tell me what you're craving and I'll help you find the perfect dish or restaurant! 🍽️",
};

const SUGGESTIONS = [
  "🍔 Suggest some spicy burgers",
  "🍕 Best pizza options?",
  "🥗 Healthy salad suggestions",
  "🧁 Local dessert specialties",
];

export default function ChatbotPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await chatbotApi.send(text);
      const reply: ChatMessage = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      toast.error(err.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (sending) return;
    // Clean suggestion of emoji
    const cleanText = suggestion.replace(/^[\s\S]*?\s/, '').trim();
    await sendMessage(cleanText);
  };

  if (authLoading) return <div className="min-h-screen bg-slate-950"><Navbar /><PageLoader /></div>;

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col pb-6">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-6 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <div className="glass-card p-4 rounded-2xl mb-4 border-slate-800 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Bot size={22} className="text-brand-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                Food Assistant <Sparkles size={14} className="text-amber-400 animate-pulse" />
              </h1>
              <p className="text-xs text-slate-400">Powered by FoodRush AI</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 glass-card border-slate-800/80 p-4 sm:p-6 overflow-y-auto mb-4 space-y-4 shadow-inner flex flex-col scrollbar-hide">
          <div className="flex-1 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border ${
                  msg.role === 'assistant' 
                    ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white font-medium rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-850 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 text-brand-400">
                  <Bot size={18} />
                </div>
                <div className="bg-slate-900/90 border border-slate-850 rounded-2xl rounded-tl-none px-5 py-4 shadow-lg">
                  <div className="flex gap-1.5 items-center justify-center h-4">
                    <div className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !sending && (
          <div className="grid grid-cols-2 gap-2 mb-4 animate-fade-in-up">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="glass-card hover:bg-slate-900 border border-slate-800 hover:border-brand-500/30 text-left p-3.5 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white transition-all shadow-md active:scale-[0.98] font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-2 shadow-xl focus-within:border-brand-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me what to eat or find spicy burgers..."
            className="flex-1 bg-transparent px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-brand-500 hover:bg-brand-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <Send size={16} className="text-white" />
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
          FoodRush AI assistant can recommend food & restaurants from our system database
        </p>
      </div>
    </div>
  );
}
