import { useState } from 'react';
import { MessageCircle, X, Send, Settings, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTingiConfig } from '@/hooks/useTingiConfig';
import { searchGoogle } from '@/lib/googleCustomSearch';
import { getGreeting, generateFunnySummary, getErrorMessage } from '@/lib/tingiHumor';
import type { SearchResult } from '@/lib/googleCustomSearch';

interface Message {
  id: string;
  type: 'user' | 'tingi';
  text: string;
  results?: SearchResult[];
  isError?: boolean;
}

export function TingiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { config, saveConfig, isConfigured, isLoaded } = useTingiConfig();
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempCx, setTempCx] = useState('');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !isConfigured && isLoaded) {
      // Show config on first open if not configured
      setShowConfig(true);
      setTempApiKey(config.apiKey);
      setTempCx(config.cx);
    }
  };

  const handleSaveConfig = () => {
    if (tempApiKey.trim() && tempCx.trim()) {
      saveConfig({ apiKey: tempApiKey.trim(), cx: tempCx.trim() });
      setShowConfig(false);
      
      // Add welcome message
      if (messages.length === 0) {
        setMessages([{
          id: Date.now().toString(),
          type: 'tingi',
          text: "Hey there! I'm Tingi, your quirky search buddy! 🎉 Ask me anything and I'll fetch answers from Google with a dash of humor! 😄",
        }]);
      }
    }
  };

  const handleSearch = async () => {
    if (!inputValue.trim() || isSearching) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSearching(true);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      type: 'tingi',
      text: getGreeting(),
    }]);

    try {
      const response = await searchGoogle(userMessage.text, config.apiKey, config.cx);

      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));

      if (response.error) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'tingi',
          text: getErrorMessage(response.error || 'Unknown error'),
          isError: true,
        }]);
      } else {
        const summary = generateFunnySummary(response.results);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'tingi',
          text: summary,
          results: response.results.slice(0, 3),
        }]);
      }
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'tingi',
        text: "Yikes! Something went terribly wrong. Maybe try again? 🤷",
        isError: true,
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!isLoaded) return null;

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => handleOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Open Tingi chat assistant"
      >
        <img 
          src="/assets/generated/tingi-icon.dim_128x128.png" 
          alt="Tingi" 
          className="w-10 h-10 group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/generated/tingi-icon.dim_128x128.png" 
                  alt="Tingi" 
                  className="w-10 h-10"
                />
                <div>
                  <DialogTitle>Tingi</DialogTitle>
                  <DialogDescription>Your funny search assistant</DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfig(!showConfig)}
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Configuration Panel */}
          {showConfig && (
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="apiKey" className="text-sm">Google API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cx" className="text-sm">Search Engine ID (cx)</Label>
                  <Input
                    id="cx"
                    value={tempCx}
                    onChange={(e) => setTempCx(e.target.value)}
                    placeholder="Enter your cx"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleSaveConfig} 
                  size="sm" 
                  className="w-full"
                  disabled={!tempApiKey.trim() || !tempCx.trim()}
                >
                  Save Configuration
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4">
            {!isConfigured ? (
              <Alert>
                <AlertDescription>
                  Welcome! To get started, please configure your Google Custom Search API credentials using the settings button above. 🔧
                </AlertDescription>
              </Alert>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ask me anything! I'll search Google and give you a funny summary! 😄</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.isError
                          ? 'bg-destructive/10 text-destructive border border-destructive/20'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {message.results && message.results.length > 0 && (
                        <div className="mt-3 space-y-2 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold opacity-70">Top Results:</p>
                          {message.results.map((result, idx) => (
                            <a
                              key={idx}
                              href={result.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs hover:underline group"
                            >
                              <div className="flex items-start gap-1">
                                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                <span className="line-clamp-2">{result.title}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConfigured ? "Ask me anything..." : "Configure API first..."}
                disabled={!isConfigured || isSearching}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={!isConfigured || !inputValue.trim() || isSearching}
                size="icon"
                aria-label="Send message"
              >
                {isSearching ? (
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
