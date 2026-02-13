import type { Memory } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatTimestamp } from '../lib/format';
import { User, Calendar, ImageOff, Play, Edit, Lock } from 'lucide-react';
import { useState } from 'react';
import { VideoViewer } from './VideoViewer';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MemoryFullscreenViewerProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  unlockedUsername: string;
  currentPrincipal: string;
}

export function MemoryFullscreenViewer({ 
  memory, 
  isOpen, 
  onClose, 
  onEdit,
  unlockedUsername,
  currentPrincipal
}: MemoryFullscreenViewerProps) {
  const [imageError, setImageError] = useState(false);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);
  const { identity } = useInternetIdentity();

  // Check visibility: meow99 can only see their own memories
  const canView = unlockedUsername === 'tingi99' || 
    (unlockedUsername === 'meow99' && memory.submitter && memory.submitter.toString() === currentPrincipal);

  // Check if current user can edit this memory
  const canEdit = memory.submitter && identity 
    ? memory.submitter.toString() === identity.getPrincipal().toString()
    : false;

  const handleOpenChange = (open: boolean) => {
    // Only call onClose when the dialog is being closed (open === false)
    if (!open) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {!canView ? (
            <div className="py-12 text-center">
              <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <DialogTitle className="text-xl mb-2">Access Restricted</DialogTitle>
              <p className="text-muted-foreground">
                You do not have permission to view this memory.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Memory Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Metadata */}
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground border-b pb-4">
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
                  {memory.edited && (
                    <div className="flex items-center gap-2 text-xs italic">
                      <span>Edited {formatTimestamp(memory.edited)}</span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {memory.text}
                  </p>
                </div>

                {/* Media */}
                {(memory.imageUrl || memory.videoUrl) && (
                  <div className="space-y-4">
                    {memory.imageUrl && !imageError && (
                      <div className="rounded-lg overflow-hidden border bg-muted">
                        <img 
                          src={memory.imageUrl} 
                          alt="Memory attachment" 
                          className="w-full h-auto object-contain max-h-[500px]"
                          onError={() => setImageError(true)}
                        />
                      </div>
                    )}
                    
                    {memory.imageUrl && imageError && (
                      <div className="rounded-lg border bg-muted p-12 flex flex-col items-center justify-center text-muted-foreground">
                        <ImageOff className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm text-center">Image unavailable</p>
                      </div>
                    )}
                    
                    {memory.videoUrl && (
                      <Button
                        onClick={() => setIsVideoViewerOpen(true)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Play Video
                      </Button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {canEdit ? (
                    <Button
                      onClick={onEdit}
                      variant="default"
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Memory
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              disabled
                              variant="default"
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Memory
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Only the original author can edit this memory</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </>
          )}
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
