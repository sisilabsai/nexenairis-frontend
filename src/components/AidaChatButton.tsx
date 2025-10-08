'use client';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './AidaChatButton.css';

interface AidaChatButtonProps {
  onClick: () => void;
}

export default function AidaChatButton({ onClick }: AidaChatButtonProps) {
  const { user } = useAuth();
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Show pulse animation for first 5 seconds to draw attention
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Get a short version of company name for the button
  const getButtonText = () => {
    const companyName = user?.tenant?.company_name || user?.tenant?.name;
    if (companyName) {
      // If company name is too long, show just "Ask AIDA"
      if (companyName.length > 15) {
        return "Ask AIDA";
      }
      // Otherwise show "Ask [Company] AIDA" 
      const shortName = companyName.split(' ')[0]; // Get first word
      return `Ask ${shortName} AIDA`;
    }
    return "Ask AIDA";
  };

  return (
    <div className="aida-chat-button-container">
      <button onClick={onClick} className={`aida-chat-button ${showPulse ? 'pulse' : ''}`}>
        <SparklesIcon className="aida-chat-button-icon" />
        <span className="aida-chat-button-text">{getButtonText()}</span>
      </button>
      {showPulse && <div className="aida-button-pulse-ring"></div>}
    </div>
  );
}
