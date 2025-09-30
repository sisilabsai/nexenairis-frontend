'use client';
import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { aidaApi } from '../lib/api';
import './AidaChat.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      const startConversation = async () => {
        try {
          const response = await aidaApi.startConversation({});
          const conversation = response.data as any;
          if (conversation && conversation.conversation_id) {
            setConversationId(conversation.conversation_id);
            setMessages([
              {
                id: 'initial-assistant-message',
                type: 'assistant',
                content: "Hello! I'm Aida, your intelligent assistant. How can I help you today? You can ask me things like 'What can you do?'",
              },
            ]);
          }
        } catch (error) {
          console.error('Error starting conversation:', error);
          setMessages([
            {
              id: 'error-message',
              type: 'assistant',
              content: "I'm sorry, but I'm having trouble connecting right now. Please try again later.",
            },
          ]);
        }
      };
      startConversation();
    }
  }, [isOpen, conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setMessages(prev => [
      ...prev,
      {
        id: `assistant-typing-${Date.now()}`,
        type: 'assistant',
        content: '',
        isTyping: true,
      },
    ]);

    try {
      if (!conversationId) {
        throw new Error('Conversation not started.');
      }
      if (input.toLowerCase().includes('what can you do')) {
        const capabilities = await aidaApi.getCapabilities();
        const capabilitiesList = Object.entries(capabilities.data as any).map(([key, value]) => `- **${key.replace(/_/g, ' ')}:** ${value}`).join('\n');
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `Here's what I can do:\n${capabilitiesList}`,
        };
        setMessages(prev => prev.filter(m => !m.isTyping));
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const response = await aidaApi.sendMessage(conversationId, { message: input });
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: (response.data as any)?.ai_message?.content || 'Sorry, I could not process that.',
        };

        setMessages(prev => prev.filter(m => !m.isTyping));
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "I'm sorry, an error occurred. Please try again.",
      };
      setMessages(prev => prev.filter(m => !m.isTyping));
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        {messages.map(msg => (
          <div key={msg.id} className={`aida-chat-message ${msg.type}`}>
            {msg.isTyping ? (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="aida-chat-input-area">
        <form onSubmit={handleSendMessage} className="aida-chat-form">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Aida anything..."
            className="aida-chat-input"
            disabled={isLoading}
          />
          <button type="submit" className="aida-chat-send-btn" disabled={isLoading}>
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
