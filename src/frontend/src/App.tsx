import { MemorySubmitForm } from './components/MemorySubmitForm';
import { MemoryList } from './components/MemoryList';
import { PasswordGate } from './components/PasswordGate';
import { WelcomePage } from './components/WelcomePage';
import { TingiWidget } from './components/TingiWidget';
import { useMemories } from './hooks/useMemories';
import { usePasswordGate } from './hooks/usePasswordGate';
import { useWelcomeGate } from './hooks/useWelcomeGate';
import { Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const { memories, isLoading, error } = useMemories();
  const { isUnlocked, isInitializing: isPasswordInitializing, unlock, lock } = usePasswordGate();
  const { isDismissed, isInitializing: isWelcomeInitializing, dismiss, reset } = useWelcomeGate();

  // Show nothing while checking session storage
  if (isPasswordInitializing || isWelcomeInitializing) {
    return null;
  }

  // Show password gate if locked
  if (!isUnlocked) {
    return <PasswordGate onUnlock={unlock} />;
  }

  // Show welcome page if unlocked but not yet dismissed
  if (!isDismissed) {
    return (
      <WelcomePage 
        onContinue={dismiss}
        onLock={() => {
          reset();
          lock();
        }}
      />
    );
  }

  // Show full site when unlocked and welcome dismissed
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/braid-icon.dim_128x128.png" 
              alt="Braid icon" 
              className="w-10 h-10 opacity-80"
            />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Rapunzel's Memory Book</h1>
              <p className="text-sm text-muted-foreground">A collection of cherished moments</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              reset();
              lock();
            }}
            className="flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Lock
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent" />
        <img 
          src="/assets/generated/rapunzel-hero.dim_1600x600.png" 
          alt="Rapunzel memories hero banner" 
          className="w-full h-64 md:h-80 object-cover opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground drop-shadow-lg mb-2">
              Memories of Rapunzel
            </h2>
            <p className="text-lg md:text-xl text-foreground/90 drop-shadow-md flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Share your favorite moments and stories
              <Sparkles className="w-5 h-5" />
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Introduction */}
        <section className="mb-12 text-center">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This is a special place to celebrate and remember the wonderful moments we've shared with Rapunzel. 
            Whether it's a funny story, a heartfelt memory, or a simple moment that made you smile—add your memory below 
            and become part of this growing collection of love and friendship.
          </p>
        </section>

        {/* Submit Form */}
        <section className="mb-16">
          <MemorySubmitForm />
        </section>

        {/* Memories List */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border" />
            <h3 className="text-2xl font-serif font-semibold text-foreground">
              Shared Memories ({memories?.length || 0})
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <div className="text-center py-8 text-destructive">
              <p>Unable to load memories. Please try again later.</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading memories...</p>
            </div>
          )}

          {!isLoading && !error && memories && (
            <MemoryList memories={memories} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
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

      {/* Tingi Widget - Only visible when unlocked and welcome dismissed */}
      <TingiWidget />
    </div>
  );
}

export default App;
