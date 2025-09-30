"use client";

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  HashtagIcon,
  DocumentTextIcon,
  PhotoIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: number;
  type: 'message' | 'file' | 'voice';
  content: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  conversation?: {
    id: number;
    name: string;
  };
  channel?: {
    id: number;
    name: string;
  };
  timestamp: string;
  highlight?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export function GlobalSearch({ isOpen, onClose, onSelectResult }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'files' | 'people'>('all');

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: 1,
      type: 'message',
      content: 'Can we schedule a meeting to discuss the project timeline and deliverables?',
      user: { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=1' },
      conversation: { id: 1, name: 'Project Discussion' },
      timestamp: '2 hours ago',
      highlight: 'project timeline'
    },
    {
      id: 2,
      type: 'message',
      content: 'The new features have been deployed to staging environment',
      user: { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=2' },
      channel: { id: 1, name: 'development' },
      timestamp: '1 day ago',
      highlight: 'features'
    },
    {
      id: 3,
      type: 'file',
      content: 'project-specification.pdf',
      user: { id: 3, name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=3' },
      conversation: { id: 2, name: 'Client Requirements' },
      timestamp: '3 days ago',
      highlight: 'specification'
    }
  ];

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.content.toLowerCase().includes(query.toLowerCase()) ||
          result.user.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }, 300);
    } else {
      setResults([]);
    }
  }, [query]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case 'voice':
        return <MicrophoneIcon className="h-4 w-4 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr; // In real app, format properly
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'messages') return result.type === 'message';
    if (activeTab === 'files') return result.type === 'file';
    if (activeTab === 'people') return result.user.name.toLowerCase().includes(query.toLowerCase());
    return true;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 max-h-[80vh] flex flex-col">
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages, files, and people..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Search Tabs */}
            <div className="flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'all', label: 'All', count: results.length },
                { key: 'messages', label: 'Messages', count: results.filter(r => r.type === 'message').length },
                { key: 'files', label: 'Files', count: results.filter(r => r.type === 'file').length },
                { key: 'people', label: 'People', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-300 dark:bg-gray-500 text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Searching...</span>
                </div>
              </div>
            ) : query.trim() === '' ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Search Everything
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Find messages, files, and people across all your conversations and channels.
                  </p>
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">project</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">meeting</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">@john</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found for "<span className="font-medium">{query}</span>"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    onClick={() => onSelectResult(result)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <img
                        src={result.user.avatar || `https://i.pravatar.cc/150?u=${result.user.id}`}
                        alt={result.user.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {result.user.name}
                          </span>
                          <span className="text-gray-400">in</span>
                          <div className="flex items-center space-x-1">
                            {result.conversation ? (
                              <>
                                <UserIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {result.conversation.name}
                                </span>
                              </>
                            ) : result.channel ? (
                              <>
                                <HashtagIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {result.channel.name}
                                </span>
                              </>
                            ) : null}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-400 ml-auto">
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatTime(result.timestamp)}</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          {getResultIcon(result.type)}
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {result.highlight ? (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: result.content.replace(
                                    new RegExp(result.highlight, 'gi'),
                                    `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$&</mark>`
                                  )
                                }}
                              />
                            ) : (
                              result.content
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Footer */}
          {query.trim() && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex items-center space-x-4">
                  <span>Press ↑↓ to navigate</span>
                  <span>Press ↵ to select</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}