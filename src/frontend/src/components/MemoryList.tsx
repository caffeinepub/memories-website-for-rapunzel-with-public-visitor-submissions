import type { Memory } from '../backend';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { formatTimestamp } from '../lib/format';
import { User, Calendar, ImageOff, Play } from 'lucide-react';
import { useState } from 'react';
import { VideoViewer } from './VideoViewer';

interface MemoryListProps {
  memories: Memory[];
}

export function MemoryList({ memories }: MemoryListProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-16">
        <img 
          src="/assets/generated/braid-icon.dim_128x128.png" 
          alt="No memories yet" 
          className="w-20 h-20 mx-auto mb-4 opacity-40"
        />
        <p className="text-lg text-muted-foreground">
          No memories yet. Be the first to share a special moment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {memories.map((memory) => (
        <MemoryCard key={memory.id.toString()} memory={memory} />
      ))}
    </div>
  );
}

function MemoryCard({ memory }: { memory: Memory }) {
  const [imageError, setImageError] = useState(false);
  const [isVideoViewerOpen, setIsVideoViewerOpen] = useState(false);

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap text-sm text-muted-foreground">
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
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
            {memory.text}
          </p>
          
          {(memory.imageUrl || memory.videoUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {memory.imageUrl && !imageError && (
                <div className="rounded-lg overflow-hidden border bg-muted">
                  <img 
                    src={memory.imageUrl} 
                    alt="Memory attachment" 
                    className="w-full h-auto object-contain max-h-96"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              
              {memory.imageUrl && imageError && (
                <div className="rounded-lg border bg-muted p-8 flex flex-col items-center justify-center text-muted-foreground">
                  <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm text-center">Image unavailable</p>
                </div>
              )}
              
              {memory.videoUrl && (
                <div className="rounded-lg border bg-muted p-8 flex flex-col items-center justify-center">
                  <Play className="w-12 h-12 mb-3 text-primary" />
                  <Button
                    onClick={() => setIsVideoViewerOpen(true)}
                    variant="default"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Open Video
                  </Button>
                </div>
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
    </>
  );
}
