"use client";

import { useState, useRef, useEffect } from 'react';
import { useMessages, useSendMessage, useChannelMessages, useSendChannelMessage, useAuth, useAddReaction, useRemoveReaction, useInitiateVoiceCall, useAcceptVoiceCall, useRejectVoiceCall } from '@/hooks/useApi';
import { Conversation, Message, User, MessageReaction, VoiceCall } from '@/types';
import { Channel } from '@/types/chat';
import VoiceCallModal from './VoiceCallModal';
import { useQueryClient } from '@tanstack/react-query';

// Import echo conditionally to prevent SSR issues
let echo: any = null;
// Using a dynamic import with browser check to prevent SSR issues
if (typeof window !== 'undefined') {
  // This is a safe way to import the module only on the client side
  import('@/lib/echo').then(module => {
    echo = module.default;
  });
}
import { UrlPreview } from './UrlPreview';
import { 
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  StopIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PhotoIcon,
  DocumentIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

interface MessageWindowProps {
  conversation?: Conversation;
  channel?: Channel;
}

export function MessageWindow({ conversation, channel }: MessageWindowProps) {
  const { me } = useAuth();
  const user = me.data?.data?.user;
  const id = conversation?.id || channel?.id;
  const isChannel = !!channel;
  
  // Use appropriate hooks based on whether it's a conversation or channel
  const conversationMessages = useMessages(conversation?.id || 0);
  const channelMessages = useChannelMessages(channel?.id || 0);
  const conversationSendMessage = useSendMessage(conversation?.id || 0);
  const channelSendMessage = useSendChannelMessage(channel?.id || 0);
  
  // Select the appropriate data based on type
  const messagesResponse = isChannel ? channelMessages.data : conversationMessages.data;
  const isLoading = isChannel ? channelMessages.isLoading : conversationMessages.isLoading;
  const isError = isChannel ? channelMessages.isError : conversationMessages.isError;
  const sendMessage = isChannel ? channelSendMessage : conversationSendMessage;
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const initiateVoiceCall = useInitiateVoiceCall();
  const acceptVoiceCall = useAcceptVoiceCall();
  const rejectVoiceCall = useRejectVoiceCall();
  const [incomingCall, setIncomingCall] = useState<VoiceCall | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<VoiceCall | null>(null);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended' | null>(null);

  const messages = messagesResponse?.data?.data || [];

  useEffect(() => {
    audioPlayer.current = new Audio('https://res.cloudinary.com/dc0uiujvn/video/upload/v1757202437/mixkit-doorbell-tone-2864_ayedu1.wav');
  }, []);


  useEffect(() => {
    if (!id) return;
    const echoChannel = conversation ? `conversation.${id}` : `channel.${id}`;
    const queryKey = isChannel ? ['chat', 'channel-messages', id] : ['chat', 'messages', id];
    const channel = echo.private(echoChannel);

    channel.listen('MessageSent', (e: any) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        const newData = { ...oldData };
        newData.data.data = [e.message, ...newData.data.data];
        return newData;
      });
    });

    channel.listen('MessageReactionAdded', (e: any) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        const newData = { ...oldData };
        const message = newData.data.data.find((m: Message) => m.id === e.reaction.message_id);
        if (message) {
          if (!message.reactions) {
            message.reactions = [];
          }
          message.reactions.push(e.reaction);
        }
        return newData;
      });
    });

    channel.listen('MessageReactionRemoved', (e: any) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        const newData = { ...oldData };
        const message = newData.data.data.find((m: Message) => m.id === e.reaction.message_id);
        if (message) {
          message.reactions = message.reactions?.filter((r: MessageReaction) => r.id !== e.reaction.id);
        }
        return newData;
      });
    });

    channel.listenForWhisper('typing', (e: any) => {
      const user = e as User;
      setTypingUsers((prev) => [...prev, user]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.id !== user.id));
      }, 3000);
    });

    return () => {
      channel.stopListening('MessageSent');
      channel.stopListening('MessageReactionAdded');
      channel.stopListening('MessageReactionRemoved');
    };
  }, [id, queryClient]);

  useEffect(() => {
    const channel = echo.private(`user.${user?.id}`);

    channel.listen('VoiceCallInitiated', (e: any) => {
      setIncomingCall(e.call);
      setCallStatus('ringing');
    });

    channel.listen('VoiceCallAccepted', (e: any) => {
      if (outgoingCall && outgoingCall.id === e.call.id) {
        setCallStatus('connected');
      }
    });

    channel.listen('VoiceCallEnded', (e: any) => {
      if (incomingCall && incomingCall.id === e.call.id) {
        setIncomingCall(null);
        setCallStatus(null);
      }
      if (outgoingCall && outgoingCall.id === e.call.id) {
        setOutgoingCall(null);
        setCallStatus(null);
      }
    });

    return () => {
      channel.stopListening('VoiceCallInitiated');
      channel.stopListening('VoiceCallAccepted');
      channel.stopListening('VoiceCallEnded');
    };
  }, [user?.id, incomingCall, outgoingCall]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && files.length === 0 && !recordedAudio) return;

    const payload: { content: string; files: File[]; voice_note?: Blob } = {
      content: newMessage,
      files: files,
    };

    if (recordedAudio) {
      payload.voice_note = recordedAudio;
    }

    try {
      await sendMessage.mutateAsync(payload as any);
      setNewMessage('');
      setFiles([]);
      setRecordedAudio(null);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleTyping = () => {
    if (!id) return;
    const echoChannel = conversation ? `conversation.${id}` : `channel.${id}`;
    const channel = echo.private(echoChannel);
    channel.whisper('typing', user);
  };

  const handleAddReaction = (messageId: number, reaction: string) => {
    addReaction.mutate({ messageId, reaction });
  };

  const handleRemoveReaction = (messageId: number, reactionId: number) => {
    removeReaction.mutate({ messageId, reactionId });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg; codecs=opus' });
        setRecordedAudio(audioBlob);
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleInitiateCall = () => {
    if (conversation) {
      const receiver = conversation.users.find(u => u.id !== user?.id);
      if (receiver) {
        initiateVoiceCall.mutate(receiver.id, {
          onSuccess: (data: any) => {
            setOutgoingCall(data.data.data);
            setCallStatus('ringing');
          }
        });
      }
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      acceptVoiceCall.mutate(incomingCall.id);
      setCallStatus('connected');
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      rejectVoiceCall.mutate(incomingCall.id);
      setIncomingCall(null);
      setCallStatus(null);
    }
    if (outgoingCall) {
      rejectVoiceCall.mutate(outgoingCall.id);
      setOutgoingCall(null);
      setCallStatus(null);
    }
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (isError) return <div>Failed to load messages</div>;

  const renderMedia = (media: any) => {
    const fileUrl = `http://localhost:8000/storage/${media.file_path}`;
    const fileName = media.file_path.split('/').pop();

    if (media.file_type.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-full h-auto rounded-lg mt-2"
        />
      );
    }

    if (media.file_type.startsWith('video/')) {
      return (
        <video controls className="max-w-full h-auto rounded-lg mt-2">
          <source src={fileUrl} type={media.file_type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (media.file_type === 'application/pdf') {
      return (
        <div className="mt-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline mb-2 inline-block"
          >
            {fileName}
          </a>
          <iframe
            src={fileUrl}
            className="w-full h-96 rounded-lg"
            title={fileName}
          />
        </div>
      );
    }

    // Fallback for other file types
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg mt-2 hover:bg-gray-300 dark:hover:bg-gray-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm">{fileName}</span>
      </a>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Voice Call Modal */}
      {(incomingCall || outgoingCall) && callStatus && (
        <VoiceCallModal
          isOpen={!!(incomingCall || outgoingCall)}
          onClose={handleRejectCall}
          caller={
            incomingCall 
              ? { name: incomingCall.caller.name, avatar: incomingCall.caller.avatar || `https://i.pravatar.cc/150?u=${incomingCall.caller.id}` }
              : { name: 'You', avatar: user?.profile_photo_path || `https://i.pravatar.cc/150?u=${user?.id}` }
          }
          receiver={
            outgoingCall 
              ? { name: outgoingCall.receiver.name, avatar: outgoingCall.receiver.avatar || `https://i.pravatar.cc/150?u=${outgoingCall.receiver.id}` }
              : undefined
          }
          callStatus={callStatus}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          isOutgoing={!!outgoingCall}
        />
      )}

      {/* Premium Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between p-6">
          {/* Chat Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {conversation ? (
                  conversation.users.find(u => u.id !== user?.id)?.name?.charAt(0).toUpperCase() ||
                  conversation.name?.charAt(0).toUpperCase() || 'C'
                ) : (
                  channel?.name?.charAt(0).toUpperCase() || '#'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {conversation ? (
                  conversation.name || 
                  conversation.users.filter(u => u.id !== user?.id).map(u => u.name).join(', ')
                ) : (
                  channel?.name
                )}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <UserIcon className="h-4 w-4" />
                <span>
                  {conversation ? 
                    `${conversation.users.length} members` : 
                    `#${channel?.name} channel`
                  }
                </span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {conversation && (
              <>
                <button 
                  onClick={handleInitiateCall}
                  className="p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-all duration-200 group"
                  title="Voice Call"
                >
                  <PhoneIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
                
                <button className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-200 group">
                  <VideoCameraIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
            
            <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all duration-200 group">
              <InformationCircleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Start the conversation! 🚀
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Send a message to begin your chat with {conversation ? 
                  conversation.users.filter(u => u.id !== user?.id).map(u => u.name).join(', ') : 
                  `the ${channel?.name} channel`
                }.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message: Message) => {
            const isOwnMessage = message.user.id === user?.id;
            const userLike = message.reactions?.find(
              (reaction) => reaction.user_id === user?.id && reaction.reaction === '👍'
            );
            const likeCount = message.reactions?.filter(
              (reaction) => reaction.reaction === '👍'
            ).length || 0;

            const handleLikeClick = () => {
              if (userLike) {
                handleRemoveReaction(message.id, userLike.id);
              } else {
                handleAddReaction(message.id, '👍');
              }
            };

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
              >
                {/* Avatar for others */}
                {!isOwnMessage && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={message.user.profile_photo_path || `https://i.pravatar.cc/150?u=${message.user.id}`}
                      alt={message.user.name}
                      className="w-10 h-10 rounded-full shadow-md border-2 border-white dark:border-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                )}

                {/* Message Content */}
                <div className={`max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                      isOwnMessage
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {/* Sender Name */}
                    {!isOwnMessage && (
                      <p className="font-semibold text-sm mb-1 text-indigo-600 dark:text-indigo-400">
                        {message.user.name}
                      </p>
                    )}

                    {/* Message Content */}
                    {message.type === 'voice_note' && message.voice_note_path ? (
                      <div className="flex items-center space-x-3 bg-black/10 rounded-xl p-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <MicrophoneIcon className="h-4 w-4" />
                        </div>
                        <audio 
                          controls 
                          src={`http://localhost:8000/storage/${message.voice_note_path}`}
                          className="flex-1 h-8"
                        />
                      </div>
                    ) : message.content && (
                      <div className="text-sm leading-relaxed">
                        {message.content.split(' ').map((part, index) => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g;
                          if (urlRegex.test(part)) {
                            return <UrlPreview key={index} url={part} />;
                          }
                          return <span key={index}>{part} </span>;
                        })}
                      </div>
                    )}

                    {/* Media Attachments */}
                    {message.media && message.media.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.media.map((media: any) => (
                          <div key={media.id} className="rounded-xl overflow-hidden">
                            {renderMedia(media)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp and Read Status */}
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {isOwnMessage && (
                        <div className="flex items-center space-x-1">
                          {message.read_at ? (
                            <CheckCircleIconSolid className="h-4 w-4 text-blue-300" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.map((reaction) => (
                          <button
                            key={reaction.id}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-xs rounded-full px-2 py-1 transition-all duration-200 transform hover:scale-105"
                            onClick={() => handleRemoveReaction(message.id, reaction.id)}
                          >
                            {reaction.reaction}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwnMessage ? 'order-2' : 'order-3'}`}>
                  <button
                    className={`p-2 rounded-full transition-all duration-200 ${
                      userLike ? 
                        'bg-red-100 dark:bg-red-900/30 text-red-500' : 
                        'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500'
                    }`}
                    onClick={handleLikeClick}
                    title="Like"
                  >
                    {userLike ? (
                      <HeartIconSolid className="h-4 w-4" />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                  </button>
                  {likeCount > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[1rem] text-center">
                      {likeCount}
                    </span>
                  )}
                </div>

                {/* Avatar for own messages */}
                {isOwnMessage && (
                  <div className="relative flex-shrink-0 order-3">
                    <img
                      src={message.user.profile_photo_path || `https://i.pravatar.cc/150?u=${message.user.id}`}
                      alt={message.user.name}
                      className="w-10 h-10 rounded-full shadow-md border-2 border-white dark:border-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers.map((user) => user.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        </div>
      )}

      {/* File Upload Preview */}
      {files.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {files.map(f => f.name).join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFiles([])}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              ✕
            </button>
          </div>
          {sendMessage.isPending && (
            <div className="mt-2">
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Note Preview */}
      {recordedAudio && (
        <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MicrophoneIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              <audio src={URL.createObjectURL(recordedAudio)} controls className="h-8" />
            </div>
            <button
              onClick={() => setRecordedAudio(null)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20 p-6">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* File Upload */}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            multiple
          />
          <label
            htmlFor="file-upload"
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all duration-200 cursor-pointer group"
            title="Attach File"
          >
            <PaperClipIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </label>

          {/* Voice Recording */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-xl transition-all duration-200 group ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
          >
            {isRecording ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Type your message..."
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-yellow-500 transition-all duration-200"
              title="Add Emoji"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className={`p-3 rounded-xl transition-all duration-200 transform ${
              (!newMessage.trim() && files.length === 0 && !recordedAudio) || sendMessage.isPending
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
            }`}
            disabled={(!newMessage.trim() && files.length === 0 && !recordedAudio) || sendMessage.isPending}
            title="Send Message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
