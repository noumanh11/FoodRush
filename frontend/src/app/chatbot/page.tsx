'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, ArrowLeft, Bot, User, Sparkles, ChefHat, Pizza,
  Plus, Trash2, History, X, Loader2
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { chatbotApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_CONTENT = "Welcome to the **Foodie Chef Assistant Kitchen**! 🧑‍🍳\n\nI'm trained to find the most delicious dishes, search local menus, and suggest perfect flavor pairings. Tell me what you're craving today (e.g., *'spicy burger'*, *'sweet desserts'*, or *'healthy salads'*), and let's craft your order!";

const SUGGESTIONS = [
  {
    title: "🍔 Gourmet Burgers",
    desc: "Discover the juiciest smash burgers and loaded fries near you.",
    prompt: "Suggest some spicy burgers"
  },
  {
    title: "🍕 Handcrafted Pizza",
    desc: "Find wood-fired, artisanal Neapolitan pizzas and toppings.",
    prompt: "Best pizza options?"
  },
  {
    title: "🥗 Fresh & Healthy",
    desc: "Explore organic salads, vegan bowls, and light selections.",
    prompt: "Healthy salad suggestions"
  },
  {
    title: "🧁 Dessert Specialties",
    desc: "Locate local desserts, waffles, churros, and bakery treats.",
    prompt: "Local dessert specialties"
  }
];

// Helper to parse simple markdown bold and bullet lists for clean rendering
const formatMessageContent = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const bulletMatch = line.match(/^(\s*[•\-\*]\s+)(.*)/);
    let content = line;
    let isBullet = false;

    if (bulletMatch) {
      isBullet = true;
      content = bulletMatch[2];
    }

    const boldParts = content.split(/(\*\*.*?\*\*)/g);
    const parsedLine = boldParts.map((boldPart, bIdx) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-bold text-foreground transition-colors">
            {boldPart.slice(2, -2)}
          </strong>
        );
      }
      const italicParts = boldPart.split(/(\*.*?\*)/g);
      return italicParts.map((italicPart, iIdx) => {
        if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
          return (
            <em key={iIdx} className="italic text-foreground/95 font-medium">
              {italicPart.slice(1, -1)}
            </em>
          );
        }
        return italicPart;
      });
    });

    if (isBullet) {
      return (
        <li key={lineIdx} className="ml-5 list-disc pl-1 text-foreground my-1 leading-relaxed text-xs sm:text-sm transition-colors">
          {parsedLine}
        </li>
      );
    }

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <p key={lineIdx} className="my-1 leading-relaxed text-xs sm:text-sm text-foreground transition-colors">
        {parsedLine}
      </p>
    );
  });
};

export default function ChatbotPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const res = await chatbotApi.getConversations();
      setConversations(res.data);
      if (res.data.length > 0 && !activeConvId) {
        selectConversation(res.data[0].id);
      } else if (res.data.length === 0) {
        await startNewChat();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load conversations list.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    setLoadingMessages(true);
    setMobileSidebarOpen(false);
    try {
      const res = await chatbotApi.getMessages(id);
      const mapped = res.data.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewChat = async () => {
    try {
      const res = await chatbotApi.createConversation();
      setConversations((prev) => [res.data, ...prev]);
      setActiveConvId(res.data.id);
      setMessages([]); // Start clean welcome
      setMobileSidebarOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create new chat session.');
    }
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await chatbotApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success('Chat deleted.');
      if (activeConvId === id) {
        setMessages([]);
        setActiveConvId(null);
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          await startNewChat();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete chat.');
    }
  };

  const sendMessage = async (text: string) => {
    if (!activeConvId) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await chatbotApi.sendMessage(activeConvId, text);
      const reply: ChatMessage = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, reply]);
      
      // Reload conversations list to sync dynamic titles
      const convsRes = await chatbotApi.getConversations();
      setConversations(convsRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Chatbot execution failed.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, Chef had trouble whipping that up. Please try again!' },
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

  const handleSuggestionClick = async (promptText: string) => {
    if (sending) return;
    await sendMessage(promptText);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[100dvh] bg-background transition-colors duration-300">
        <Navbar />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background transition-colors duration-300">
      <Navbar />

      <div className="flex flex-1 min-h-0 w-full relative">
        
        {/* Left Desktop Sidebar (Claude-style) */}
        <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex transition-colors duration-300">
          <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Chat History</span>
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-400 hover:bg-brand-500/10 transition-colors text-xs font-bold"
            >
              <Plus size={14} /> New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="animate-spin text-brand-400" size={20} />
                <span className="text-xs text-muted-foreground font-semibold">Loading history...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground font-bold">No chat history found.</div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer group transition-all text-xs font-semibold border ${
                    activeConvId === c.id 
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{c.title}</span>
                  <button
                    onClick={(e) => deleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-1 rounded-md transition-all shrink-0 hover:bg-red-500/10"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Collapsible Mobile History Sidebar Drawer */}
        <div className={`absolute inset-y-0 left-0 w-[260px] border-r border-border bg-card shadow-2xl z-30 flex flex-col md:hidden transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Chat History</span>
            <button
              onClick={startNewChat}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-400 hover:bg-brand-500/10 transition-colors text-[10px] font-bold"
            >
              <Plus size={12} /> New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="animate-spin text-brand-400" size={18} />
                <span className="text-[10px] text-muted-foreground font-semibold">Loading history...</span>
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer group transition-all text-xs font-semibold border ${
                    activeConvId === c.id 
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{c.title}</span>
                  <button
                    onClick={(e) => deleteConversation(e, c.id)}
                    className="hover:text-red-500 p-1 rounded-md transition-all shrink-0 hover:bg-red-500/10"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Sidebar backdrop */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Right Chat Workspace Column */}
        <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-4 pt-3 sm:pt-6 pb-3 sm:pb-6 max-w-3xl mx-auto w-full">
          
          {/* Header Area */}
          <div className="glass-card mb-3 sm:mb-4 flex shrink-0 items-center justify-between rounded-2xl border border-border p-3 sm:p-4 shadow-md transition-all">
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="md:hidden shrink-0 rounded-xl border border-border bg-card p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <History size={14} />
              </button>
              <Link href="/" className="shrink-0 rounded-xl border border-border bg-card p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground">
                <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              </Link>
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
                <ChefHat size={18} className="text-brand-400 sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground text-sm sm:text-lg tracking-tight flex items-center gap-1">
                  Foodie Chef Assistant <Sparkles size={12} className="text-amber-400 animate-pulse sm:w-3.5 sm:h-3.5" />
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Online &bull; Your personal culinary discoverer
                </p>
              </div>
            </div>
          </div>

          {/* Messages Feed View */}
          <div className="glass-card mb-3 sm:mb-4 flex flex-1 flex-col overflow-y-auto rounded-2xl sm:rounded-3xl border border-border p-3 sm:p-6 shadow-inner scrollbar-hide">
            {loadingMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-brand-500" />
                <span className="text-sm text-muted-foreground font-bold">Loading conversation...</span>
              </div>
            ) : (
              <div className="flex-1 space-y-4 sm:space-y-6">
                {messages.length === 0 ? (
                  <div className="flex gap-2 sm:gap-4 animate-fade-in-up">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                      <ChefHat size={14} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-4 text-xs sm:text-sm leading-relaxed shadow-md border bg-card border-border rounded-tl-none">
                      <div className="prose prose-sm dark:prose-invert text-foreground">
                        {formatMessageContent(WELCOME_CONTENT)}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border shadow-md transition-transform hover:scale-105 ${
                        msg.role === 'assistant' 
                          ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                          : 'bg-secondary border-border text-foreground'
                      }`}>
                        {msg.role === 'assistant' ? <ChefHat size={14} className="sm:w-[18px] sm:h-[18px]" /> : <User size={14} className="sm:w-[18px] sm:h-[18px]" />}
                      </div>
                      
                      <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-4 text-xs sm:text-sm leading-relaxed shadow-md border ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-brand-500 to-amber-600 border-brand-600/30 text-white rounded-tr-none'
                          : 'bg-card border-border text-foreground rounded-tl-none'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                            {formatMessageContent(msg.content)}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex gap-2 sm:gap-4 animate-pulse">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                      <ChefHat size={14} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div className="rounded-2xl sm:rounded-3xl rounded-tl-none border border-border bg-card px-4 py-3 sm:px-6 sm:py-4.5 shadow-md">
                      <div className="flex h-4 items-center justify-center gap-1.5">
                        <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Suggestions Grid (only for empty threads) */}
          {messages.length === 0 && !sending && (
            <div className="mb-3 sm:mb-4 animate-fade-in-up shrink-0">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Craving Inspiration?</h3>
              <div className="flex sm:grid sm:grid-cols-2 gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => handleSuggestionClick(s.prompt)}
                    className="glass-card rounded-2xl border border-border p-3 sm:p-4 text-left shadow-md transition-all hover:border-brand-500/40 hover:-translate-y-0.5 active:scale-[0.99] group flex flex-col justify-between shrink-0 w-[240px] sm:w-auto"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground mb-1 group-hover:text-brand-400 transition-colors">{s.title}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-normal">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form Deck */}
          <form onSubmit={handleSend} className="flex flex-col gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl border border-border bg-card p-2 sm:p-3 shadow-xl transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Chef what to eat or search local menus..."
              className="w-full bg-transparent px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              disabled={sending || !activeConvId}
            />
            <div className="flex items-center justify-between border-t border-border pt-1.5 sm:pt-2 px-2 sm:px-3 mt-0.5 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground flex items-center gap-1 sm:gap-1.5">
                <Pizza size={10} className="text-brand-400 sm:w-3 sm:h-3" />
                Chef searches active restaurants and prices
              </span>
              <button
                type="submit"
                disabled={!input.trim() || sending || !activeConvId}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-brand-500 shadow-md shadow-brand-500/25 transition-all hover:bg-brand-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shrink-0"
              >
                <Send size={12} className="text-white sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
