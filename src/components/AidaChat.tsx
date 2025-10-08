'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { aidaApi } from '../lib/api';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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

  // Quick suggestions for better UX - personalized for the business
  const companyName = user?.tenant?.company_name || user?.tenant?.name || 'our business';
  const quickSuggestions = [
    "What can you do for us?",
    `Show me ${companyName}'s sales analytics`,
    `Generate a ${companyName} performance report`,
    `Help with ${companyName}'s inventory`,
  ];

  // Simple function to format message content
  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text **text**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text *text*
      .replace(/^• (.*$)/gm, '<span class="bullet-item">• $1</span>') // Bullet points
      .replace(/^(#{1,6})\s+(.*$)/gm, (match, hashes, text) => {
        const level = hashes.length;
        return `<h${level} class="message-heading">${text}</h${level}>`;
      }); // Headers
  };

  const initializeConversation = useCallback(async () => {
    try {
      setConnectionError(false);
      const response = await aidaApi.startConversation({});
      const conversation = response.data as any;
      if (conversation && conversation.conversation_id) {
        setConversationId(conversation.conversation_id);
        
        // Get company name from user's tenant data
        const companyName = user?.tenant?.company_name || user?.tenant?.name || 'your business';
        const userName = user?.name?.split(' ')[0] || 'there';
        
        setMessages([
          {
            id: 'initial-assistant-message',
            type: 'assistant',
            content: `👋 Hello ${userName}! I'm AIDA, ${companyName}'s AI-powered business intelligence assistant.\n\nI'm here to help ${companyName} with:\n• 📊 Analyzing your business data and metrics\n• 📈 Generating insights and detailed reports\n• ❓ Answering questions about your operations\n• 💡 Providing strategic recommendations\n• 🎯 Identifying growth opportunities\n\nWhat would you like to explore about ${companyName} today?`,
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
  }, [user]);

  useEffect(() => {
    if (isOpen && !conversationId && !connectionError) {
      // Add a small delay to ensure user data is loaded
      const timeoutId = setTimeout(() => {
        initializeConversation();
      }, 100);
      
      return () => clearTimeout(timeoutId);
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
        
        const companyName = user?.tenant?.company_name || user?.tenant?.name || 'your business';
        
        // Format the capabilities in a more readable way
        let formattedCapabilities = '';
        
        // Add available modules
        if (capabilities.modules && Array.isArray(capabilities.modules)) {
          formattedCapabilities += `📚 **Available Modules:**\n${capabilities.modules.map((module: string) => `• ${module.charAt(0).toUpperCase() + module.slice(1)}`).join('\n')}\n\n`;
        }
        
        // Add suggestions by category
        if (capabilities.suggestions && typeof capabilities.suggestions === 'object') {
          formattedCapabilities += `🎯 **What I can help you with:**\n\n`;
          Object.entries(capabilities.suggestions).forEach(([category, items]: [string, any]) => {
            formattedCapabilities += `**${category}:**\n`;
            if (Array.isArray(items)) {
              formattedCapabilities += items.map((item: string) => `• ${item}`).join('\n') + '\n\n';
            }
          });
        }
        
        // Add quick actions
        if (capabilities.quick_actions && Array.isArray(capabilities.quick_actions)) {
          formattedCapabilities += `⚡ **Quick Actions:**\n${capabilities.quick_actions.map((action: string) => `• ${action}`).join('\n')}\n\n`;
        }
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `🚀 **Here's how I can help ${companyName}:**\n\n${formattedCapabilities}💬 Just ask me anything about ${companyName}'s data, and I'll provide insights tailored to your business needs!`,
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
          <div className="title-content">
            <span className="main-title">AIDA</span>
            <span className="company-subtitle">{user?.tenant?.company_name || user?.tenant?.name || 'Business Assistant'}</span>
          </div>
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
                <div 
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />
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
            placeholder={isLoading ? "AIDA is thinking..." : `Ask AIDA about ${user?.tenant?.company_name || 'your business'}...`}
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
