import { useState } from 'react';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generatePidduResponse } from '@/lib/pidduDeterministic';

interface Message {
  id: string;
  type: 'user' | 'piddu' | 'loading';
  text: string;
}

export function PidduWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && messages.length === 0) {
      // Add welcome message on first open
      setMessages([{
        id: Date.now().toString(),
        type: 'piddu',
        text: "Hello! I'm Piddu, your friendly assistant! 🌟 I'm here to chat and help you with questions about memories, creativity, and more. What's on your mind today?",
      }]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      type: 'loading',
      text: 'Thinking...',
    }]);

    // Simulate processing time for more natural feel
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    // Generate deterministic response
    const response = generatePidduResponse(userQuery);

    // Remove loading message and add response
    setMessages(prev => [
      ...prev.filter(m => m.id !== loadingId),
      {
        id: Date.now().toString(),
        type: 'piddu',
        text: response,
      }
    ]);

    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => handleOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-primary to-secondary hover:shadow-2xl shadow-lg transition-all duration-300 flex items-center justify-center group hover:scale-105 border-2 border-primary/20"
        aria-label="Open Piddu chat assistant"
      >
        <img 
          src="/assets/generated/piddu-icon.dim_128x128.png" 
          alt="Piddu" 
          className="w-12 h-12 group-hover:scale-110 transition-transform duration-200"
        />
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px] h-[650px] flex flex-col p-0 gap-0 bg-gradient-to-b from-background to-muted/20">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/assets/generated/piddu-icon.dim_128x128.png" 
                  alt="Piddu" 
                  className="w-12 h-12 rounded-xl"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background" />
              </div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Piddu
                  <Sparkles className="w-4 h-4 text-accent" />
                </DialogTitle>
                <DialogDescription>Your intelligent companion</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-sm leading-relaxed max-w-xs mx-auto">
                  Start a conversation! Ask me anything about memories, creativity, or just chat with me.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md shadow-md'
                          : message.type === 'loading'
                          ? 'bg-muted/70 text-muted-foreground rounded-bl-md animate-pulse'
                          : 'bg-card text-card-foreground rounded-bl-md shadow-sm border border-border/50'
                      }`}
                    >
                      {message.type === 'loading' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{message.text}</span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="flex-1 rounded-xl border-border/50 focus-visible:ring-primary"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                size="icon"
                aria-label="Send message"
                className="rounded-xl w-10 h-10"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
