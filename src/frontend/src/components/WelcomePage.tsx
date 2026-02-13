import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Lock, Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onContinue: () => void;
  onLock: () => void;
}

export function WelcomePage({ onContinue, onLock }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-3xl w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <img 
              src="/assets/generated/braid-icon.dim_128x128.png" 
              alt="Rapunzel's braid" 
              className="w-24 h-24 opacity-90"
            />
          </div>
          <CardTitle className="text-4xl font-serif font-bold text-foreground">
            Welcome to Rapunzel's Memory Book
          </CardTitle>
          <p className="text-xl font-serif text-muted-foreground">
            Made for Tingi
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Hero Image */}
          <div className="rounded-lg overflow-hidden border-2 border-border">
            <img 
              src="/assets/generated/rapunzel-hero.dim_1600x600.png" 
              alt="Rapunzel memories" 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4 text-center">
            <p className="text-lg text-foreground leading-relaxed">
              You've unlocked a special place filled with love, laughter, and cherished memories. 
              This memory book is a celebration of all the wonderful moments we've shared with Rapunzel.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Every memory here is a treasure, a piece of the beautiful story we're writing together.
              <Sparkles className="w-5 h-5 text-accent" />
            </p>
            <p className="text-base text-foreground leading-relaxed flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
              Thank you for being part of this journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={onContinue}
              size="lg"
              className="flex-1 text-lg font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Enter the Memory Book
            </Button>
            <Button 
              onClick={onLock}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              <Lock className="mr-2 h-5 w-5" />
              Lock
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
