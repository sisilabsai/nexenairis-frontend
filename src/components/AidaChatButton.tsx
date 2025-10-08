'use client';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import './AidaChatButton.css';

interface AidaChatButtonProps {
  onClick: () => void;
}

export default function AidaChatButton({ onClick }: AidaChatButtonProps) {
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Show pulse animation for first 5 seconds to draw attention
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="aida-chat-button-container">
      <button onClick={onClick} className={`aida-chat-button ${showPulse ? 'pulse' : ''}`}>
        <SparklesIcon className="aida-chat-button-icon" />
        <span className="aida-chat-button-text">Ask AIDA</span>
      </button>
      {showPulse && <div className="aida-button-pulse-ring"></div>}
    </div>
  );
}
