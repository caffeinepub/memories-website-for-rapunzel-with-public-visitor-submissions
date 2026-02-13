import { useState, useRef, useEffect } from 'react';
import { Music, Upload, Play, Pause, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { useSongs, useUploadSong } from '@/hooks/useSongs';
import { fileToUint8Array, uint8ArrayToDataUrl } from '@/lib/audio';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function MusicBoxWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { songs, isLoading: isSongsLoading } = useSongs();
  const uploadMutation = useUploadSong();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setValidationError('Please select a valid audio file.');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || validationError) return;

    try {
      const bytes = await fileToUint8Array(selectedFile);
      await uploadMutation.mutateAsync({
        bytes,
        fileName: selectedFile.name,
      });
      
      // Clear selection after successful upload
      handleRemoveFile();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handlePlayPause = (songId: string, songBytes: Uint8Array, fileName: string) => {
    // If clicking the currently playing song, pause it
    if (currentlyPlayingId === songId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentlyPlayingId(null);
      }
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play new audio
    try {
      const dataUrl = uint8ArrayToDataUrl(songBytes, fileName);
      const audio = new Audio(dataUrl);
      
      audio.addEventListener('ended', () => {
        setCurrentlyPlayingId(null);
      });

      audio.addEventListener('error', () => {
        setCurrentlyPlayingId(null);
        console.error('Error playing audio');
      });

      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        setCurrentlyPlayingId(null);
      });

      audioRef.current = audio;
      setCurrentlyPlayingId(songId);
    } catch (error) {
      console.error('Failed to create audio:', error);
    }
  };

  const isUploadDisabled = !selectedFile || !!validationError || uploadMutation.isPending;

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-primary to-secondary hover:shadow-2xl shadow-lg transition-all duration-300 flex items-center justify-center group hover:scale-105 border-2 border-primary/20"
        aria-label="Open Music Box"
      >
        <img 
          src="/assets/generated/music-box-icon.dim_128x128.png" 
          alt="Music Box" 
          className="w-12 h-12 group-hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Music Box Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] h-[650px] flex flex-col p-0 gap-0 bg-gradient-to-b from-background to-muted/20">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/assets/generated/music-box-icon.dim_128x128.png" 
                  alt="Music Box" 
                  className="w-12 h-12 rounded-xl"
                />
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Music Box
                  <Music className="w-4 h-4 text-accent" />
                </DialogTitle>
                <DialogDescription>Share and enjoy music together</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Upload Section */}
          <div className="px-6 py-4 border-b border-border/50 bg-card/30">
            <Label htmlFor="audio-upload" className="text-sm font-medium mb-2 block">
              Upload a song
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  id="audio-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={uploadMutation.isPending}
                />
                {selectedFile && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={uploadMutation.isPending}
                    aria-label="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {selectedFile && !validationError && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)
                </div>
              )}

              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {uploadMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to upload song. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {uploadMutation.isSuccess && (
                <Alert>
                  <AlertDescription className="text-success">
                    Song uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUpload}
                disabled={isUploadDisabled}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload song
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-3 border-b border-border/50 bg-card/20">
              <h3 className="text-sm font-medium">
                Shared Songs ({songs?.length || 0})
              </h3>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              {isSongsLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                  <p className="text-sm">Loading songs...</p>
                </div>
              )}

              {!isSongsLoading && (!songs || songs.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Music className="w-16 h-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm leading-relaxed max-w-xs mx-auto">
                    No songs yet. Upload the first song to get started!
                  </p>
                </div>
              )}

              {!isSongsLoading && songs && songs.length > 0 && (
                <div className="space-y-2">
                  {songs.map(([id, song]) => {
                    const songId = id.toString();
                    const isPlaying = currentlyPlayingId === songId;
                    const displayName = song.title || song.fileName || 'Untitled audio';

                    return (
                      <Card key={songId} className="p-3 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Button
                            variant={isPlaying ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => handlePlayPause(songId, song.bytes, song.fileName)}
                            className="shrink-0"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {displayName}
                            </p>
                            {song.artist && (
                              <p className="text-xs text-muted-foreground truncate">
                                {song.artist}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
