
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, User, Bot, Paperclip, Image, Calendar, Mail, BarChart2, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';

const UnifiedChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI companion. I can help you with scheduling meetings, managing emails, analyzing data, and more. What can I help you with today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const getAgentIcon = (agentType) => {
    switch (agentType) {
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'analytics':
        return <BarChart2 className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const loadingMessage = {
      id: messages.length + 2,
      type: 'bot',
      isLoading: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const response = await fetch('https://ai-agents-deploy-1.onrender.com/process_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: inputValue }),
      });

      const data = await response.json();

      setMessages(prev => prev.filter(msg => msg.id !== loadingMessage.id));

      if (response.ok) {
        const botResponse = {
          id: messages.length + 3,
          type: 'bot',
          content: data.result,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Error response with retry suggestions
        const botResponse = {
          id: messages.length + 3,
          type: 'bot',
          content: `I encountered an issue: ${data.error_details}\n\nAnalysis: ${data.analysis}\n\nSuggested retry: ${data.suggested_retry}`,
          timestamp: new Date(),
          actions: [
            "Error encountered",
            "Providing alternative suggestion",
            "Ready for retry"
          ]
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      // Network or other errors
      const botResponse = {
        id: messages.length + 3,
        type: 'bot',
        content: "I'm having trouble connecting to the server. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsProcessing(false);
    }
  };


  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.type === 'user' ? 'bg-blue-100 ml-2' : 'bg-gray-100 mr-2'
        }`}>
          {message.type === 'user' ? (
            <User className="h-5 w-5 text-blue-600" />
          ) : (
            message.isLoading ? 
            <Loader2 className="h-5 w-5 text-gray-600 animate-spin" /> :
            <Bot className="h-5 w-5 text-gray-600" />
          )}
        </div>
        
        <div className={`rounded-2xl p-4 ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            <>
              <p className="text-sm">{message.content}</p>
              {message.actions && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-xs mt-2 block opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.interimResults = true;

      recognition.addEventListener('result', e => {
        const transcript = Array.from(e.results)
          .map(result => result[0].transcript)
          .join('');

        setInputValue(transcript); // Changed from setInputText to setInputValue to match existing state
      });

      recognition.addEventListener('end', () => {
        setIsRecording(false);
      });
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        alert('Speech recognition is not supported in your browser.');
      }
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-semibold">AI Companion</h1>
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>
            
            <button
              type="button"
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'
              }`}
              onClick={handleMicClick}
            >
              <Mic className="h-5 w-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            />

<button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className={`p-2 rounded-lg ${
                inputValue.trim() && !isProcessing
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400'
              } transition-colors`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UnifiedChatbot;


