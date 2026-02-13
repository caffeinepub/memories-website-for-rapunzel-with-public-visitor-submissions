import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatView } from './ChatView';

export function ChatFullPage() {
  const handleClose = () => {
    // Remove the view parameter and reload
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Chat</h1>
              <p className="text-sm text-muted-foreground">Rapunzel's Memory Book</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col overflow-hidden">
        <Card className="flex-1 flex flex-col shadow-lg border-2 border-primary/20 overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ChatView />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>© {new Date().getFullYear()} Rapunzel's Memory Book</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Built with <span className="text-destructive">♥</span> using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
