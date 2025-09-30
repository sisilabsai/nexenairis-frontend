import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  caller: {
    name: string;
    avatar: string;
  };
  receiver?: {
    name: string;
    avatar: string;
  };
  callStatus: 'ringing' | 'connected' | 'ended';
  onAccept: () => void;
  onReject: () => void;
  isOutgoing?: boolean;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  caller,
  receiver,
  callStatus,
  onAccept,
  onReject,
  isOutgoing,
}) => {
  const ringtoneRef = useRef<HTMLAudioElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setLocalStream(stream);
        } catch (error) {
          console.error('Error accessing media devices.', error);
        }
      };
      startStream();
    } else {
      localStream?.getTracks().forEach(track => track.stop());
    }

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && callStatus === 'ringing' && !isOutgoing) {
      ringtoneRef.current?.play();
    } else {
      ringtoneRef.current?.pause();
    }
  }, [isOpen, callStatus]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">{isOutgoing ? 'Outgoing Voice Call' : 'Incoming Voice Call'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={isOutgoing ? receiver?.avatar : caller.avatar} alt={isOutgoing ? receiver?.name : caller.name} />
            <AvatarFallback>{isOutgoing ? receiver?.name?.charAt(0) : caller.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{isOutgoing ? receiver?.name : caller.name}</h3>
          <p className="text-sm text-gray-500">{callStatus}...</p>
        </div>
        <DialogFooter>
          {callStatus === 'ringing' && !isOutgoing && (
            <>
              <Button variant="outline" onClick={onReject}>
                Reject
              </Button>
              <Button onClick={onAccept}>Accept</Button>
            </>
          )}
          {(callStatus === 'connected' || (callStatus === 'ringing' && isOutgoing)) && (
            <Button variant="destructive" onClick={onReject}>
              End Call
            </Button>
          )}
        </DialogFooter>
        <audio ref={ringtoneRef} src="/sounds/ringtone.mp3" loop />
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCallModal;
