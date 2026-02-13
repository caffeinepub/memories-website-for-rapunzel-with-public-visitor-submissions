import type { Memory } from '../backend';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { formatTimestamp } from '../lib/format';
import { User, Calendar, ImageOff, Play, Maximize2, Edit } from 'lucide-react';
import { useState } from 'react';
import { VideoViewer } from './VideoViewer';
import { MemoryFullscreenViewer } from './MemoryFullscreenViewer';
import { MemoryEditDialog } from './MemoryEditDialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MemoryListProps {
  memories: Memory[];
  emptyStateMessage?: string;
  unlockedUsername: string;
  currentPrincipal: string;
}

export function MemoryList({ 
  memories, 
  emptyStateMessage = 'No memories yet. Be the first to share a special moment!',
  unlockedUsername,
  currentPrincipal
}: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-16">
        <img 
          src="/assets/generated/braid-icon.dim_128x128.png" 
          alt="No memories yet" 
          className="w-20 h-20 mx-auto mb-4 opacity-40"
        />
        <p className="text-lg text-muted-foreground">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {memories.map((memory) => (
        <MemoryCard 
          key={memory.id.toString()} 
          memory={memory}
          unlockedUsername={unlockedUsername}
          currentPrincipal={currentPrincipal}
        />
      ))}
    </div>
  );
}

interface MemoryCardProps {
  memory: Memory;
  unlockedUsername: string;
  currentPrincipal: string;
}

function MemoryCard({ memory, unlockedUsername, currentPrincipal }: MemoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { identity } = useInternetIdentity();

  // Check if current user can edit this memory
  // For tingi99: can edit if submitter matches current principal
  // For meow99: can edit only if submitter matches current principal (and it's already visible due to filtering)
  const canEdit = memory.submitter && identity 
    ? memory.submitter.toString() === identity.getPrincipal().toString()
    : false;

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-4 flex-wrap">
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
            <div className="flex items-center gap-2">
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="h-8"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Only the original author can edit this memory</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreenOpen(true)}
                className="h-8"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
            {memory.text}
          </p>

          {(memory.imageUrl || memory.videoUrl) && (
            <div className="flex gap-3 flex-wrap">
              {memory.imageUrl && !imageError && (
                <div className="rounded-lg overflow-hidden border bg-muted max-w-xs">
                  <img 
                    src={memory.imageUrl} 
                    alt="Memory attachment" 
                    className="w-full h-auto object-cover max-h-48"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              
              {memory.imageUrl && imageError && (
                <div className="rounded-lg border bg-muted p-8 flex flex-col items-center justify-center text-muted-foreground max-w-xs">
                  <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs text-center">Image unavailable</p>
                </div>
              )}
              
              {memory.videoUrl && (
                <Button
                  onClick={() => setIsVideoViewerOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play Video
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {memory.videoUrl && (
        <VideoViewer
          videoUrl={memory.videoUrl}
          isOpen={isVideoViewerOpen}
          onClose={() => setIsVideoViewerOpen(false)}
        />
      )}

      <MemoryFullscreenViewer
        memory={memory}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        onEdit={() => {
          setIsFullscreenOpen(false);
          setIsEditDialogOpen(true);
        }}
        unlockedUsername={unlockedUsername}
        currentPrincipal={currentPrincipal}
      />

      <MemoryEditDialog
        memory={memory}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        canEdit={canEdit}
      />
    </>
  );
}
