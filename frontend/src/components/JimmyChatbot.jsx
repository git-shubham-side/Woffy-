import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import chatbotService from '../services/chatbotService';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Info,
} from 'lucide-react';

const STORAGE_KEY = 'woffy_jimmy_chat_history_v1';

// Custom lightweight markdown & formatted text renderer
const FormattedMessage = ({ content, onActionClick }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-800 break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet point item
        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^(•|-|\*)\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-blue-500 font-bold text-xs mt-1 select-none">•</span>
              <span className="flex-1">{renderFormattedSpans(bulletText, onActionClick)}</span>
            </div>
          );
        }

        // Numbered list item like 1. 2. 3.
        const numMatch = trimmed.match(/^(\d+\.)\s*(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-blue-600 font-semibold text-xs mt-0.5 select-none">{numMatch[1]}</span>
              <span className="flex-1">{renderFormattedSpans(numMatch[2], onActionClick)}</span>
            </div>
          );
        }

        // Warning or Alert line
        if (trimmed.startsWith('⚠️') || trimmed.startsWith('🚨') || trimmed.includes('WARNING') || trimmed.includes('RED FLAGS')) {
          return (
            <div
              key={idx}
              className="p-2.5 my-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-start gap-2 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">{renderFormattedSpans(trimmed, onActionClick)}</div>
            </div>
          );
        }

        return <p key={idx}>{renderFormattedSpans(line, onActionClick)}</p>;
      })}
    </div>
  );
};

// Helper to parse **bold** and [links](/path)
function renderFormattedSpans(text, onActionClick) {
  if (!text) return null;

  // Split by markdown link pattern [text](url) or bold **text**
  const parts = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Check bold **...**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check link [...](...)
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);

    let nextMatch = null;
    let matchType = null;

    if (boldMatch && linkMatch) {
      if (boldMatch.index < linkMatch.index) {
        nextMatch = boldMatch;
        matchType = 'bold';
      } else {
        nextMatch = linkMatch;
        matchType = 'link';
      }
    } else if (boldMatch) {
      nextMatch = boldMatch;
      matchType = 'bold';
    } else if (linkMatch) {
      nextMatch = linkMatch;
      matchType = 'link';
    }

    if (nextMatch && nextMatch.index !== undefined) {
      // Add text before the match
      if (nextMatch.index > 0) {
        parts.push(remaining.substring(0, nextMatch.index));
      }

      if (matchType === 'bold') {
        parts.push(
          <strong key={keyCounter++} className="font-semibold text-slate-900">
            {nextMatch[1]}
          </strong>
        );
        remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
      } else if (matchType === 'link') {
        const linkText = nextMatch[1];
        const linkUrl = nextMatch[2];
        parts.push(
          <button
            key={keyCounter++}
            type="button"
            onClick={() => onActionClick && onActionClick(linkUrl)}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {linkText}
            <ExternalLink className="w-3 h-3 inline" />
          </button>
        );
        remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
      }
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
}

const JimmyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message from Jimmy (RAG Powered)
  const defaultInitialMessage = {
    id: 'welcome-1',
    role: 'assistant',
    content: `Woof! Hello! 🐶🐾 I'm **Jimmy**, your RAG-powered Woffy AI Companion!\n\nI have **live access** to your account (pets, vaccines, health logs) and Woffy platform database (shop products, vet hospitals, rescue shelters)!\n\nI can help you with:\n• 🐶 **Your Registered Pets & Health Overview**\n• 💉 **Live Vaccine Due Dates & Digital Passports**\n• 🛍️ **Woffy Shop Products & Best Dog Food**\n• 🚑 **Emergency Vet Hospitals & Animal Shelters**\n• 🏷️ **Smart Collar QR Tags & Lost Pet Switch**\n• 🩺 **Dog Nutrition, Symptoms & First-Aid**\n\nAap mujhse **English ya Hindi** me kuch bhi pooch sakte hain!`,
    suggestions: [
      '🐶 My Registered Pets',
      '💉 Vaccine Schedule & Due Dates',
      '🛍️ Dog Food in Woffy Shop',
      '🍖 Safe & Toxic Foods',
    ],
    timestamp: new Date().toISOString(),
  };

  // Chat message history
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [defaultInitialMessage];
  });

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not cache Jimmy chat history:', e);
    }
  }, [messages]);

  // Load user pets for pet-specific context
  useEffect(() => {
    let isMounted = true;
    const loadPets = async () => {
      if (isAuthenticated) {
        const pets = await chatbotService.getUserPets();
        if (isMounted && pets && pets.length > 0) {
          setUserPets(pets);
          if (!selectedPetId) {
            setSelectedPetId(pets[0]._id);
          }
        }
      } else {
        if (isMounted) {
          setUserPets([]);
          setSelectedPetId('');
        }
      }
    };
    loadPets();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Listen to custom window events e.g. from Navbar or landing buttons: "open-jimmy-chat"
  useEffect(() => {
    const handleOpenChat = (event) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (event?.detail?.query) {
        handleSendMessage(event.detail.query);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    };

    window.addEventListener('open-jimmy-chat', handleOpenChat);
    return () => {
      window.removeEventListener('open-jimmy-chat', handleOpenChat);
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend = null) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query || !query.trim() || isLoading) return;

    const trimmed = query.trim();
    setInputMessage('');

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = newHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatbotService.sendMessage(trimmed, {
        petId: selectedPetId || null,
        history: historyPayload,
      });

      const botMsg = {
        id: `jimmy-${Date.now()}`,
        role: 'assistant',
        content: res.reply || "Woof! I'm here to help. Could you ask that in another way?",
        suggestions: res.suggestions || [
          'My Registered Pets',
          'Vaccine Schedule & Due Dates',
          'Dog Food in Shop',
        ],
        actionLink: res.actionLink || null,
        ragMeta: res.ragMeta || null,
        timestamp: res.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `jimmy-${Date.now()}`,
        role: 'assistant',
        content: `Woof! Network thoda slow hai. But I am always here for you and your dog! Try asking again in a moment. 🐶`,
        suggestions: ['Dog Diet Tips', 'Puppy Vaccine Schedule', 'Emergency First Aid'],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([defaultInitialMessage]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleActionClick = (url) => {
    if (!url) return;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  };

  return (
    <>
      {/* Floating Action Button Docked at Bottom-Right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
        {/* Unopened Friendly Callout Pill */}
        {!isOpen && (
          <div
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="mb-2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs font-semibold shadow-lg border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer animate-float-gentle group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-700 group-hover:text-blue-600 transition-colors">
              Chat with <strong>Jimmy 🐾</strong>
            </span>
          </div>
        )}

        {/* The Main Round Jimmy Launcher Button */}
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group focus:outline-hidden"
            title="Open Jimmy - Pet Care Assistant"
            aria-label="Open Jimmy Pet Care Assistant"
          >
            {/* Friendly Dog Icon Badge */}
            <div className="relative flex items-center justify-center">
              <span className="text-2xl group-hover:scale-110 transition-transform">🐶</span>
              <span className="absolute -bottom-1 -right-1 text-xs">🐾</span>
            </div>

            {/* Online Green Indicator Dot */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Window Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 print:hidden ${
            isMinimized
              ? 'bottom-5 right-5 w-72 h-14'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] h-[calc(100vh-5rem)] sm:h-[620px] max-h-[85vh]'
          }`}
        >
          <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ring-1 ring-black/5">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-inner shrink-0">
                  <span>🐶</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-tight">Jimmy</h3>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white uppercase tracking-wider">
                      RAG AI Companion
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Account & Live Database Synced
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* When not minimized: Show Body & Input */}
            {!isMinimized && (
              <>
                {/* Optional Pet Context Selector (If logged in & user has registered pets) */}
                {userPets.length > 0 && (
                  <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0">
                    <span className="flex items-center gap-1.5 font-medium text-[11px] text-slate-500">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      Advice for:
                    </span>
                    <select
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-800 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="">General Dog Care</option>
                      {userPets.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.petName} ({p.breed || 'Dog'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Messages Container */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50/60 to-white">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[85%]">
                        {/* Jimmy Avatar next to bot messages */}
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center text-xs shrink-0 mb-1 shadow-xs border border-white">
                            🐶
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 shadow-xs text-sm ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          ) : (
                            <>
                              {msg.ragMeta &&
                                (msg.ragMeta.isAccountGrounded ||
                                  msg.ragMeta.productsRetrieved > 0 ||
                                  msg.ragMeta.hospitalsRetrieved > 0 ||
                                  msg.ragMeta.rescuesRetrieved > 0) && (
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md mb-2 border border-sky-100/80 w-fit">
                                    <Sparkles className="w-3 h-3 text-sky-500" />
                                    <span>Live Woffy Data Grounded</span>
                                  </div>
                                )}
                              <FormattedMessage content={msg.content} onActionClick={handleActionClick} />
                            </>
                          )}

                          {/* Quick Action Button Link (if provided by Jimmy) */}
                          {msg.actionLink && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center">
                              <button
                                type="button"
                                onClick={() => handleActionClick(msg.actionLink.url)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer group"
                              >
                                <span>{msg.actionLink.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-up Suggestion Chips underneath the latest bot message */}
                      {msg.role === 'assistant' &&
                        index === messages.length - 1 &&
                        msg.suggestions &&
                        msg.suggestions.length > 0 &&
                        !isLoading && (
                          <div className="mt-2.5 pl-9 flex flex-wrap gap-1.5 max-w-full">
                            {msg.suggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSendMessage(suggestion)}
                                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-sky-500" />
                                <span>{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* Loading indicator when Jimmy is typing */}
                  {isLoading && (
                    <div className="flex items-end gap-2 max-w-[85%]">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 to-sky-400 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                        🐶
                      </div>
                      <div className="rounded-2xl rounded-bl-xs px-4 py-3 bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">Jimmy is thinking</span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Jimmy... (e.g. kutta khana nahi kha raha)"
                        className="w-full pl-3.5 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Medical Disclaimer Note */}
                  <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1 font-normal">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    Jimmy is an AI guide. For medical emergencies, always consult a licensed vet.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default JimmyChatbot;
