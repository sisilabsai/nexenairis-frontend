'use client';
import { SparklesIcon } from '@heroicons/react/24/solid';
import './AidaChatButton.css';

interface AidaChatButtonProps {
  onClick: () => void;
}

export default function AidaChatButton({ onClick }: AidaChatButtonProps) {
  return (
    <button onClick={onClick} className="aida-chat-button">
      <SparklesIcon className="aida-chat-button-icon" />
      <span className="aida-chat-button-text">Ask Aida</span>
    </button>
  );
}
