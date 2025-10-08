'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { aidaApi } from '../lib/api';
import './AidaChat.css';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  isTyping?: boolean;
  timestamp?: Date;
  error?: boolean;
}

interface AidaChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AidaChat({ isOpen, onClose }: AidaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Quick suggestions for better UX
  const quickSuggestions = [
    "What can you do?",
    "Show me sales analytics",
    "Generate a report",
    "Help with inventory",
  ];

  const initializeConversation = useCallback(async () => {
    try {
      setConnectionError(false);
      const response = await aidaApi.startConversation({});
      const conversation = response.data as any;
      if (conversation && conversation.conversation_id) {
        setConversationId(conversation.conversation_id);
        setMessages([
          {
            id: 'initial-assistant-message',
            type: 'assistant',
            content: "👋 Hello! I'm AIDA, your AI-powered business intelligence assistant.\n\nI can help you:\n• Analyze your business data\n• Generate insights and reports\n• Answer questions about your operations\n• Provide recommendations\n\nWhat would you like to explore today?",
            timestamp: new Date(),
          },
        ]);
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setConnectionError(true);
      setMessages([
        {
          id: 'error-message',
          type: 'system',
          content: "🔌 Connection failed. I'm having trouble connecting to the server. Please check your internet connection and try again.",
          timestamp: new Date(),
          error: true,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !conversationId && !connectionError) {
      initializeConversation();
    }
  }, [isOpen, conversationId, connectionError, initializeConversation]);

  const handleSendMessage = async (e: React.FormEvent, messageText?: string) => {
    e.preventDefault();
    const messageToSend = messageText || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingId = `assistant-typing-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: typingId,
        type: 'assistant',
        content: '',
        isTyping: true,
      },
    ]);

    try {
      if (!conversationId) {
        throw new Error('Conversation not started.');
      }

      let response;
      
      // Handle special commands
      if (messageToSend.toLowerCase().includes('what can you do') || messageToSend.toLowerCase().includes('capabilities')) {
        response = await aidaApi.getCapabilities();
        const capabilities = response.data as any;
        const capabilitiesList = Object.entries(capabilities)
          .map(([key, value]) => `• **${key.replace(/_/g, ' ').toUpperCase()}:** ${value}`)
          .join('\n');
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `🚀 **Here's what I can help you with:**\n\n${capabilitiesList}\n\nJust ask me anything about your business data!`,
          timestamp: new Date(),
        };
        
        setMessages(prev => prev.filter(m => m.id !== typingId));
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Send regular message
        response = await aidaApi.sendMessage(conversationId, { message: messageToSend });
        
        const aiResponse = (response.data as any)?.ai_message?.content || 
                          (response.data as any)?.content || 
                          'I understand your request, but I need a bit more context to provide the best help.';
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        };

        setMessages(prev => prev.filter(m => m.id !== typingId));
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setConnectionError(false);
      setRetryCount(0);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      let errorContent = "⚠️ I encountered an issue processing your request. ";
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent += "It seems like there's a connection problem. Please check your internet and try again.";
          setConnectionError(true);
        } else {
          errorContent += "This might be a temporary issue. Please try rephrasing your question or try again in a moment.";
        }
      } else {
        errorContent += "Please try again or contact support if the problem persists.";
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: errorContent,
        timestamp: new Date(),
        error: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleRetryConnection = () => {
    setMessages([]);
    setConversationId(null);
    setConnectionError(false);
    initializeConversation();
  };

  if (!isOpen) return null;

  return (
    <div className="aida-chat-container">
      <div className="aida-chat-header">
        <div className="aida-chat-title">
          <SparklesIcon className="aida-chat-icon" />
          <span>Aida Chat</span>
        </div>
        <button onClick={onClose} className="aida-chat-close-btn">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="aida-chat-messages">
        {messages.length === 0 && !connectionError && (
          <div className="aida-chat-empty-state">
            <SparklesIcon className="aida-empty-icon" />
            <p>Starting conversation with AIDA...</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`aida-chat-message ${msg.type} ${msg.error ? 'error' : ''}`}>
            {msg.isTyping ? (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            ) : (
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.timestamp && (
                  <span className="message-timestamp">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {connectionError && (
          <div className="aida-retry-section">
            <button onClick={handleRetryConnection} className="aida-retry-btn">
              <ArrowPathIcon className="h-4 w-4" />
              Retry Connection
            </button>
          </div>
        )}
        
        {messages.length > 0 && messages.length === 1 && !connectionError && (
          <div className="aida-suggestions">
            <p className="suggestions-title">Try asking:</p>
            <div className="suggestions-grid">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="suggestion-chip"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      <div className="aida-chat-input-area">
        <form onSubmit={handleSendMessage} className="aida-chat-form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isLoading ? "AIDA is thinking..." : "Ask AIDA anything about your business..."}
            className="aida-chat-input"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button type="submit" className="aida-chat-send-btn" disabled={isLoading}>
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
