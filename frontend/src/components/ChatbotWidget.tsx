'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  X, MessageSquare, Plus, Trash2, Send, ChefHat, 
  Sparkles, User, Pizza, Loader2, ChevronRight, History
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { chatbotApi } from '@/lib/api';
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

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on messages update
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load conversations list when widget is opened
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const res = await chatbotApi.getConversations();
      setConversations(res.data);
      
      // Auto-select latest active conversation if none active
      if (res.data.length > 0 && !activeConvId) {
        selectConversation(res.data[0].id);
      } else if (res.data.length === 0) {
        // Start a default conversation
        await startNewChat();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load conversations history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConvId(id);
    setLoadingMessages(true);
    setShowHistorySidebar(false);
    try {
      const res = await chatbotApi.getMessages(id);
      const mapped = res.data.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat messages.');
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
      setShowHistorySidebar(false);
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
      toast.success('Chat deleted successfully.');
      
      if (activeConvId === id) {
        setMessages([]);
        setActiveConvId(null);
        // Load fallback latest chat session
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          await startNewChat();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete conversation.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !activeConvId) return;

    const text = input.trim();
    setInput('');
    
    // Add user message immediately
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

  const pathname = usePathname();
  if (!user || pathname === '/chatbot') return null;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-amber-600 text-white shadow-xl shadow-brand-500/25 transition-all duration-300 hover:scale-105 hover:rotate-6 active:scale-95 group border border-brand-400/25"
        title="Chat with Chef"
      >
        {isOpen ? <X size={24} /> : <ChefHat size={26} className="group-hover:animate-pulse" />}
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Slide-over Drawer */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border p-4 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className={`p-2 rounded-xl border border-border bg-background transition-colors hover:text-brand-500 hover:bg-secondary ${
                showHistorySidebar ? 'text-brand-500 bg-secondary' : 'text-muted-foreground'
              }`}
              title="Chat History"
            >
              <History size={16} />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
              <ChefHat size={18} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1">
                Foodie Chef Assistant <Sparkles size={12} className="text-amber-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl transition-colors hover:bg-secondary border border-transparent hover:border-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* Floating Chat Workspace Area */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden bg-background">
          
          {/* History Collapsible Sidebar Overlay */}
          <div className={`absolute inset-y-0 left-0 w-[240px] border-r border-border bg-card shadow-lg z-10 flex flex-col transition-transform duration-300 ${
            showHistorySidebar ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-3 border-b border-border flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Previous Chats</span>
              <button 
                onClick={startNewChat}
                className="p-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-400 hover:bg-brand-500/10 transition-colors"
                title="Start New Chat"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 size={18} className="animate-spin text-brand-400" />
                  <span className="text-[10px] text-muted-foreground font-semibold">Loading logs...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 text-[10px] text-muted-foreground font-bold">No chat history found.</div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left cursor-pointer group transition-all text-xs font-medium ${
                      activeConvId === c.id 
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent'
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
          </div>

          {/* Main Messages Feed Panel */}
          <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-300">
            {loadingMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-brand-500" />
                <span className="text-xs text-muted-foreground font-bold">Loading your chat...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="space-y-4 animate-fade-in-up">
                    {/* Welcome Bubble */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400 shadow-sm">
                        <ChefHat size={14} />
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-xs leading-relaxed shadow-md border bg-card border-border">
                        <div className="prose prose-sm dark:prose-invert text-foreground">
                          {formatMessageContent(WELCOME_CONTENT)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${
                        msg.role === 'assistant' 
                          ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                          : 'bg-secondary border-border text-foreground'
                      }`}>
                        {msg.role === 'assistant' ? <ChefHat size={14} /> : <User size={14} />}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md border ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-brand-500 to-amber-600 border-brand-600/30 text-white rounded-tr-none'
                          : 'bg-card border-border text-foreground rounded-tl-none'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert text-foreground">
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
                  <div className="flex gap-3 animate-pulse">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 text-brand-400">
                      <ChefHat size={14} />
                    </div>
                    <div className="rounded-2xl rounded-tl-none border border-border bg-card px-4 py-2.5 shadow-sm">
                      <div className="flex h-3 items-center justify-center gap-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500/60" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
            
            {/* Input Form Deck */}
            <div className="p-3 bg-card border-t border-border shrink-0">
              <form onSubmit={handleSend} className="flex flex-col gap-1.5 rounded-2xl border border-border bg-background p-2 shadow-md focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Chef what to eat or suggest dishes..."
                  className="w-full bg-transparent px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
                  disabled={sending || !activeConvId}
                />
                <div className="flex items-center justify-between border-t border-border pt-1.5 px-2 shrink-0">
                  <span className="text-[8px] font-medium text-muted-foreground flex items-center gap-1">
                    <Pizza size={9} className="text-brand-400" />
                    Chef searches active database menus
                  </span>
                  <button
                    type="submit"
                    disabled={!input.trim() || sending || !activeConvId}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 shadow-md shadow-brand-500/25 transition-all hover:bg-brand-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 shrink-0"
                  >
                    <Send size={10} className="text-white" />
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
