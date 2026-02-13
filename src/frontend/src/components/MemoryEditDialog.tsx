import type { Memory } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useState, useEffect } from 'react';
import { useEditMemory } from '../hooks/useMemories';
import { Loader2, X, Lock } from 'lucide-react';

interface MemoryEditDialogProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
  canEdit: boolean;
}

export function MemoryEditDialog({ memory, isOpen, onClose, canEdit }: MemoryEditDialogProps) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');

  const editMemory = useEditMemory();

  // Initialize form with memory data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAuthor(memory.author);
      setText(memory.text);
      setImageUrl(memory.imageUrl || '');
      setVideoUrl(memory.videoUrl || '');
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setError('');
    }
  }, [isOpen, memory]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setImageFile(file);
    setImageUrl(''); // Clear URL if file is selected
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video file size must be less than 50MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    setVideoFile(file);
    setVideoUrl(''); // Clear URL if file is selected
    setError('');
  };

  const clearImageFile = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const clearVideoFile = () => {
    setVideoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canEdit) {
      setError('You do not have permission to edit this memory');
      return;
    }

    if (text.trim().length === 0) {
      setError('Memory text cannot be empty');
      return;
    }

    // Validate mutual exclusivity for images
    if (imageUrl.trim() && imageFile) {
      setError('Please provide either an image URL or upload a file, not both');
      return;
    }

    // Validate mutual exclusivity for videos
    if (videoUrl.trim() && videoFile) {
      setError('Please provide either a video URL or upload a file, not both');
      return;
    }

    try {
      let finalImageUrl: string | null = null;
      let finalVideoUrl: string | null = null;

      // Handle image
      if (imageFile) {
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        finalImageUrl = imageDataUrl;
      } else if (imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      // Handle video
      if (videoFile) {
        const reader = new FileReader();
        const videoDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(videoFile);
        });
        finalVideoUrl = videoDataUrl;
      } else if (videoUrl.trim()) {
        finalVideoUrl = videoUrl.trim();
      }

      await editMemory.mutateAsync({
        id: memory.id,
        text: text.trim(),
        author: author.trim() || 'Anonymous',
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update memory');
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Only call onClose when the dialog is being closed (open === false)
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Edit Memory</DialogTitle>
          <DialogDescription>
            Update your memory details below
          </DialogDescription>
        </DialogHeader>

        {!canEdit ? (
          <div className="py-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">
              You do not have permission to edit this memory.
            </p>
            <p className="text-sm text-muted-foreground">
              Only the original author can make changes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Author Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-author">Your Name (optional)</Label>
              <Input
                id="edit-author"
                type="text"
                placeholder="Enter your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Memory Text */}
            <div className="space-y-2">
              <Label htmlFor="edit-text">Memory *</Label>
              <Textarea
                id="edit-text"
                placeholder="Share your memory..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {text.length}/5000 characters
              </p>
            </div>

            {/* Image Section */}
            <div className="space-y-2">
              <Label>Picture (optional)</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-image-url" className="text-sm font-normal">
                    Image URL
                  </Label>
                  <Input
                    id="edit-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={!!imageFile}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-image-file" className="text-sm font-normal">
                    Upload Image File
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={!!imageUrl.trim()}
                      className="flex-1"
                    />
                    {imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={clearImageFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {imagePreview && (
                  <div className="rounded-lg overflow-hidden border bg-muted max-w-xs">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-auto object-cover max-h-48"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Video Section */}
            <div className="space-y-2">
              <Label>Video (optional)</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-video-url" className="text-sm font-normal">
                    Video URL
                  </Label>
                  <Input
                    id="edit-video-url"
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={!!videoFile}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-video-file" className="text-sm font-normal">
                    Upload Video File
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      disabled={!!videoUrl.trim()}
                      className="flex-1"
                    />
                    {videoFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={clearVideoFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 50MB. Supported formats: MP4, WebM, OGG
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={editMemory.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editMemory.isPending || !canEdit}
              >
                {editMemory.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
