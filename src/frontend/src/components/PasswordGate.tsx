import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: (username: string, password: string) => boolean;
}

export function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length === 0) {
      setError('Please enter a username');
      return;
    }

    if (password.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    const success = onUnlock(username.trim(), password);
    if (!success) {
      setError('Incorrect username or code. Please try again.');
      setUsername('');
      setPassword('');
    }
  };

  const handlePasswordChange = (value: string) => {
    // Only allow digits and max 4 characters
    const filtered = value.replace(/\D/g, '').slice(0, 4);
    setPassword(filtered);
    if (error) setError('');
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Protected Access</CardTitle>
          <CardDescription>
            Enter your username and 4-digit code to access Rapunzel's Memory Book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Enter your username
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Access Code</Label>
              <Input
                id="password"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={4}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter 4 digits
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={username.trim().length === 0 || password.length !== 4}
            >
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
