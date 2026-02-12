import { useState } from 'react';
import { useSubmitMemory } from '../hooks/useMemories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Send, CheckCircle2, X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

const MAX_TEXT_LENGTH = 2000;
const MAX_AUTHOR_LENGTH = 100;
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true; // Empty is valid (optional field)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function MemorySubmitForm() {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoFileDataUrl, setVideoFileDataUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const submitMutation = useSubmitMemory();

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationError('Please select a valid image file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setValidationError(`Image file is too large. Maximum size is ${MAX_IMAGE_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    setSelectedImageFile(file);
    setValidationError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImageFile = () => {
    setSelectedImageFile(null);
    setImageFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setValidationError('Please select a valid video file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_VIDEO_FILE_SIZE) {
      setValidationError(`Video file is too large. Maximum size is ${MAX_VIDEO_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    setSelectedVideoFile(file);
    setValidationError('');

    // Read as data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVideoFile = () => {
    setSelectedVideoFile(null);
    setVideoFileDataUrl(null);
    // Reset file input
    const fileInput = document.getElementById('videoFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setShowSuccess(false);

    // Validation
    if (!text.trim()) {
      setValidationError('Please write a memory before submitting.');
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setValidationError(`Memory text is too long. Maximum ${MAX_TEXT_LENGTH} characters.`);
      return;
    }

    if (author.length > MAX_AUTHOR_LENGTH) {
      setValidationError(`Author name is too long. Maximum ${MAX_AUTHOR_LENGTH} characters.`);
      return;
    }

    if (imageUrl.trim() && !isValidUrl(imageUrl)) {
      setValidationError('Please enter a valid picture URL.');
      return;
    }

    if (videoUrl.trim() && !isValidUrl(videoUrl)) {
      setValidationError('Please enter a valid video URL.');
      return;
    }

    // Check for ambiguity: both URL and file provided for images
    if (imageUrl.trim() && selectedImageFile) {
      setValidationError('Please choose either a Picture URL or upload a file, not both.');
      return;
    }

    // Check for ambiguity: both URL and file provided for videos
    if (videoUrl.trim() && selectedVideoFile) {
      setValidationError('Please choose either a Video URL or upload a file, not both.');
      return;
    }

    try {
      // Determine final image URL (either from URL field or uploaded file)
      let finalImageUrl: string | null = null;
      if (selectedImageFile && imageFilePreview) {
        finalImageUrl = imageFilePreview; // Use data URL from file
      } else if (imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }

      // Determine final video URL (either from URL field or uploaded file)
      let finalVideoUrl: string | null = null;
      if (selectedVideoFile && videoFileDataUrl) {
        finalVideoUrl = videoFileDataUrl; // Use data URL from file
      } else if (videoUrl.trim()) {
        finalVideoUrl = videoUrl.trim();
      }

      await submitMutation.mutateAsync({
        text: text.trim(),
        author: author.trim() || null,
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
      });

      // Success - clear form and show message
      setText('');
      setAuthor('');
      setImageUrl('');
      setVideoUrl('');
      handleRemoveImageFile();
      handleRemoveVideoFile();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to submit memory. Please try again.');
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif">Share a Memory</CardTitle>
        <CardDescription>
          Add your favorite moment or story about Rapunzel to this collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author" className="text-base">
              Your Name <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Input
              id="author"
              type="text"
              placeholder="e.g., Sarah"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={MAX_AUTHOR_LENGTH}
              disabled={submitMutation.isPending}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory" className="text-base">
              Your Memory <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="memory"
              placeholder="Share a special moment, a funny story, or what makes Rapunzel special to you..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TEXT_LENGTH}
              disabled={submitMutation.isPending}
              rows={6}
              className="text-base resize-none"
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {text.length} / {MAX_TEXT_LENGTH} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-base">
              Picture URL <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Input
              id="imageUrl"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={submitMutation.isPending || !!selectedImageFile}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageFile" className="text-base">
              Or Upload Image <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  disabled={submitMutation.isPending || !!imageUrl.trim()}
                  className="text-base"
                />
                {selectedImageFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveImageFile}
                    disabled={submitMutation.isPending}
                    title="Remove selected file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {selectedImageFile && imageFilePreview && (
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={imageFilePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="truncate">{selectedImageFile.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedImageFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {MAX_IMAGE_FILE_SIZE / 1024 / 1024}MB. Accepted formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-base">
              Video URL <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Input
              id="videoUrl"
              type="text"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={submitMutation.isPending || !!selectedVideoFile}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoFile" className="text-base">
              Or Upload Video <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelect}
                  disabled={submitMutation.isPending || !!videoUrl.trim()}
                  className="text-base"
                />
                {selectedVideoFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveVideoFile}
                    disabled={submitMutation.isPending}
                    title="Remove selected file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {selectedVideoFile && (
                <Card className="p-3 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <VideoIcon className="w-4 h-4" />
                        <span className="truncate">{selectedVideoFile.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {MAX_VIDEO_FILE_SIZE / 1024 / 1024}MB. Accepted formats: MP4, WebM, MOV
            </p>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your memory has been added! Thank you for sharing.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={submitMutation.isPending || !text.trim()}
            className="w-full text-base"
            size="lg"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Share Memory
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
