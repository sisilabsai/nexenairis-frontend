'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: 'success' | 'error';
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  description,
  variant = 'success',
}: NotificationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={variant === 'error' ? 'text-red-600' : 'text-green-600'}>
            {title}
          </DialogTitle>
        </DialogHeader>
        <p>{description}</p>
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
