import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import Button from './Button';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am NorthBridge AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simple bot logic
    setTimeout(() => {
      setMessages([...newMessages, { role: 'bot', text: "I'm a demo assistant. For real banking issues, please contact our 24/7 support team." }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-chase-blue text-white p-4 rounded-full shadow-2xl hover:bg-chase-mid transition-all hover:scale-110 active:scale-95"
        >
          <MessageSquare size={28} />
        </button>
      ) : (
        <div className="bg-white w-96 h-[500px] rounded-2xl shadow-2xl border border-chase-border flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-chase-navy text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-chase-blue p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Customer Care AI</p>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-chase-blue text-white rounded-br-none'
                    : 'bg-chase-light text-chase-navy rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-chase-border flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-chase-blue"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-chase-blue text-white p-2 rounded-lg hover:bg-chase-mid transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
