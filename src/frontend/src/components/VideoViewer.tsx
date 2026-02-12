import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface VideoViewerProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoViewer({ videoUrl, isOpen, onClose }: VideoViewerProps) {
  const [videoError, setVideoError] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset error state when closing
      setVideoError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Memory Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!videoError ? (
            <div className="rounded-lg overflow-hidden border bg-muted">
              <video
                src={videoUrl}
                controls
                preload="none"
                className="w-full h-auto max-h-[70vh]"
                onError={() => setVideoError(true)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Video unavailable. The video could not be loaded or played.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
