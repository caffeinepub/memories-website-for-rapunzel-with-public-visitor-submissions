import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatView } from './ChatView';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLauncherClick = () => {
    // Open chat in new tab
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'chat');
    window.open(url.toString(), '_blank');
  };

  return (
    <>
      {/* Floating Launcher Button - positioned above Music Box */}
      <button
        onClick={handleLauncherClick}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-accent to-secondary hover:shadow-2xl shadow-lg transition-all duration-300 flex items-center justify-center group hover:scale-105 border-2 border-primary/30"
        aria-label="Open Chat in New Tab"
      >
        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
      </button>

      {/* In-page Chat Panel (still available for use in original tab) */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl border-2 border-primary/20 bg-background">
          <CardHeader className="pb-3 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Chat
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ChatView />
          </CardContent>
        </Card>
      )}

      {/* Hidden toggle button to open in-page panel (for testing/alternative access) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-40 right-6 z-40 w-10 h-10 rounded-full bg-muted/80 hover:bg-muted shadow-md transition-all duration-200 flex items-center justify-center opacity-50 hover:opacity-100"
          aria-label="Open Chat Panel"
          title="Open in-page chat"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </>
  );
}
