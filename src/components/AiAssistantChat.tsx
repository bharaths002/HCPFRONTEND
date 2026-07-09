import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { addUserChatMessage, sendAiChatMessage } from '../store/interactionSlice';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

export const AiAssistantChat: React.FC = () => {
  const dispatch = useAppDispatch();
  const chatMessages = useAppSelector((state) => state.interaction.chatMessages);
  const isAiLoading = useAppSelector((state) => state.interaction.isAiLoading);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const text = inputMessage.trim();
    setInputMessage('');
    dispatch(addUserChatMessage(text));
    await dispatch(sendAiChatMessage(text));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px] sticky top-20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Assistant</h3>
            <p className="text-xs text-slate-500">Log interaction via chat</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Ready
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`text-[10px] mt-1.5 block ${
                  msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing interaction details...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Describe interaction..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isAiLoading}
          className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Log</span>
        </button>
      </form>
    </div>
  );
};
