import { useState } from 'react';
import { Link as LinkIcon, Loader2, ExternalLink, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { useYouTubeLinks, useSubmitYouTubeLink } from '@/hooks/useYouTubeLinks';
import { formatTimestamp } from '@/lib/format';

interface YouTubeLinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function YouTubeLinksDialog({ isOpen, onClose }: YouTubeLinksDialogProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { links, isLoading: isLinksLoading } = useYouTubeLinks();
  const submitMutation = useSubmitYouTubeLink();

  const validateUrl = (input: string): string | null => {
    if (!input.trim()) {
      return 'Please enter a YouTube link';
    }

    try {
      const urlObj = new URL(input);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
        return 'Please enter a valid YouTube link (youtube.com or youtu.be)';
      }
      
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUrl(url);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');

    try {
      await submitMutation.mutateAsync(url);
      setUrl('');
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setValidationError('');
  };

  const isSubmitDisabled = !url.trim() || submitMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[650px] flex flex-col p-0 gap-0 bg-gradient-to-b from-background to-muted/20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-accent/20 flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl">YouTube Links</DialogTitle>
              <DialogDescription>Share YouTube videos and shorts</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Submit Form */}
        <div className="px-6 py-4 border-b border-border/50 bg-card/30">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="youtube-url" className="text-sm font-medium mb-2 block">
                YouTube link
              </Label>
              <Input
                id="youtube-url"
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={handleUrlChange}
                disabled={submitMutation.isPending}
                className="w-full"
              />
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {submitMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to submit link. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {submitMutation.isSuccess && (
              <Alert>
                <AlertDescription className="text-success">
                  Link submitted successfully!
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Submit link
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Links List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b border-border/50 bg-card/20">
            <h3 className="text-sm font-medium">
              Shared Links ({links?.length || 0})
            </h3>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {isLinksLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                <p className="text-sm">Loading links...</p>
              </div>
            )}

            {!isLinksLoading && (!links || links.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-sm leading-relaxed max-w-xs mx-auto">
                  No links yet. Share the first YouTube video!
                </p>
              </div>
            )}

            {!isLinksLoading && links && links.length > 0 && (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="space-y-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-primary hover:underline break-all group"
                      >
                        <ExternalLink className="w-4 h-4 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{link.url}</span>
                      </a>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={new Date(Number(link.timestamp) / 1000000).toISOString()}>
                          {formatTimestamp(link.timestamp)}
                        </time>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
