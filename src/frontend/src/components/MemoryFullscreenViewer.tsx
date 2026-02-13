import type { Memory } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { formatTimestamp } from '../lib/format';
import { User, Calendar, ImageOff, Play, X } from 'lucide-react';
import { useState } from 'react';
import { VideoViewer } from './VideoViewer';

interface MemoryFullscreenViewerProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryFullscreenViewer({ memory, isOpen, onClose }: MemoryFullscreenViewerProps) {
  const [imageError, setImageError] = useState(false);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <DialogTitle className="text-2xl font-serif">Memory</DialogTitle>
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {memory.author || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={new Date(Number(memory.created) / 1000000).toISOString()}>
                      {formatTimestamp(memory.created)}
                    </time>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Memory Text */}
              <div className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                {memory.text}
              </div>

              {/* Media */}
              {(memory.imageUrl || memory.videoUrl) && (
                <div className="space-y-4">
                  {memory.imageUrl && !imageError && (
                    <div className="rounded-lg overflow-hidden border bg-muted">
                      <img 
                        src={memory.imageUrl} 
                        alt="Memory attachment" 
                        className="w-full h-auto object-contain"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  )}
                  
                  {memory.imageUrl && imageError && (
                    <div className="rounded-lg border bg-muted p-12 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOff className="w-16 h-16 mb-3 opacity-50" />
                      <p className="text-sm text-center">Image unavailable</p>
                    </div>
                  )}
                  
                  {memory.videoUrl && (
                    <div className="rounded-lg border bg-muted p-12 flex flex-col items-center justify-center">
                      <Play className="w-16 h-16 mb-4 text-primary" />
                      <Button
                        onClick={() => setIsVideoViewerOpen(true)}
                        variant="default"
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Open Video
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {memory.videoUrl && (
        <VideoViewer
          videoUrl={memory.videoUrl}
          isOpen={isVideoViewerOpen}
          onClose={() => setIsVideoViewerOpen(false)}
        />
      )}
    </>
  );
}
