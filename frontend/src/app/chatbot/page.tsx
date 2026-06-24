'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
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
  content: "Hi! I'm your food discovery assistant. Tell me what you're craving and I'll help you find the perfect dish! 🍽️",
};

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatbotApi.send(input.trim());
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

  if (authLoading) return <div className="min-h-screen"><Navbar /><PageLoader /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-ghost p-1.5">
              <ArrowLeft size={18} />
            </Link>
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white">Food Discovery</h1>
              <p className="text-xs text-slate-500">Ask me what to eat!</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-brand-500/10' : 'bg-slate-800'
              }`}>
                {msg.role === 'assistant' ? (
                  <Bot size={16} className="text-brand-400" />
                ) : (
                  <User size={16} className="text-slate-400" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-brand-400" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Craving something? Ask me..."
            className="flex-1 bg-transparent px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600 mt-3">
          I can only help with food discovery — finding dishes and restaurants
        </p>
      </div>
    </div>
  );
}
