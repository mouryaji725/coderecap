import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatBox = ({ initialMessages = [], onSendMessage, chatLoading }: any) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [initialMessages]);

  const handleSend = () => {
    if (!chatInput.trim() || chatLoading) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#262935] overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-[#262935] bg-white dark:bg-[#15171E] flex items-center space-x-2">
        <BrainCircuit className="w-4 h-4 text-[#5e5ce6]" />
        <h2 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">AI Tutor Chat</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {initialMessages.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
            Ask any questions about this content!
          </div>
        )}
        {initialMessages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-[#5e5ce6] text-white' : 'bg-white dark:bg-[#222] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#333]'}`}>
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:my-1">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#222] border border-slate-200 dark:border-[#333] rounded-lg p-3 text-sm flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[#5e5ce6] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#5e5ce6] rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-1.5 h-1.5 bg-[#5e5ce6] rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-white dark:bg-[#15171E] border-t border-slate-200 dark:border-[#262935]">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#5e5ce6] focus:ring-1 focus:ring-[#5e5ce6] transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!chatInput.trim() || chatLoading}
            className="p-2 bg-[#5e5ce6] text-white rounded-lg hover:bg-[#4b49c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
