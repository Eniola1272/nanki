'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Share2, Copy, Check } from 'lucide-react';

// Define props interface
interface ShareButtonProps {
  quizId: string;
  title: string;
  description?: string;
  shareableSlug?: string;
}

export function ShareButton({ quizId, title, description, shareableSlug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shareUrl = shareableSlug 
    ? `${baseUrl}/quiz/share/${shareableSlug}`
    : `${baseUrl}/quiz/${quizId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!", {
        description: "Quiz link copied to clipboard",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Could not copy link to clipboard",
        duration: 3000,
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className="relative"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </Button>
  );
}