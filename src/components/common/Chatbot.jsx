import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const LanguageTranslator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm CIB Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user'
    };

    setMessages([...messages, newUserMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputText),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('membership') || lowerInput.includes('join')) {
      return "To become a member, click on 'Bureau' button and fill the registration form. You need to be 21+ years old, Indian citizen, and have intermediate education.";
    } else if (lowerInput.includes('contact')) {
      return "You can contact us at contact@cibindia.online or call our helpline at +91 94535 91912.";
    } else if (lowerInput.includes('donate')) {
      return "To donate, click on the 'Donate' tab. We accept bank transfers to Indian Overseas Bank. Account No: 04520200000452, IFSC: IOBA0000452.";
    } else if (lowerInput.includes('about')) {
      return "Crime Information Bureau (CIB) was formed in 2012 under Indian Act Section 1882. Our mission is to create a crime-free India.";
    } else if (lowerInput.includes('law') || lowerInput.includes('rules')) {
      return "You can find information about Indian laws in the 'Laws' section. We cover IPC, CrPC, Anti-Corruption Act, and more.";
    } else if (lowerInput.includes('news')) {
      return "Check the 'News' section for latest updates about CIB activities and crime-related news.";
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! How can I assist you today?";
    } else {
      return "Thank you for your message. For more specific queries, please contact our administration at contact@cibindia.online";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
      {/* Chat Window */}
      <div
        className={`transition-all duration-500 shadow-2xl rounded-2xl border-2 border-red-700 bg-white dark:bg-[#1a1a1a] w-[320px] h-[450px] absolute bottom-20 right-0 flex flex-col ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }`}
      >
        {/* Chat Header */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-white/5 bg-red-700 rounded-t-xl">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <span className="text-[12px] font-black text-white uppercase tracking-widest">
              CIB Assistant
            </span>
            <p className="text-[10px] text-white/80">Online now</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.sender === 'user'
                    ? 'bg-red-700 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.sender === 'bot' && <Bot size={14} className="mt-1 shrink-0" />}
                  <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs font-medium text-gray-800 dark:text-white placeholder-gray-400 outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <p className="text-[8px] text-center text-gray-400 pb-2 italic">
          AI Assistant • CIB India
        </p>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-black' : 'bg-red-700 shadow-[0_10px_40px_rgba(185,28,28,0.5)]'
        } text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 group border-2 border-white/20 cursor-pointer relative z-[10000]`}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest pl-2">
              Chat
            </span>
            <MessageCircle size={24} />
          </>
        )}
      </button>
    </div>
  );
};

export default LanguageTranslator;
