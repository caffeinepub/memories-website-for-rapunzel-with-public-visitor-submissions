import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMessages, useSubmitMessage, useDeleteMessage, useDeleteMessages } from '@/hooks/useChat';
import { useChatDisplayName } from '@/hooks/useChatDisplayName';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { formatTimeOnly } from '@/lib/format';

export function ChatView() {
  const [messageText, setMessageText] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<bigint>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<bigint | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { identity } = useInternetIdentity();
  const { displayName, setDisplayName, isValid: hasDisplayName, isLoading: nameLoading } = useChatDisplayName();
  const { data: messages, isLoading, error } = useMessages();
  const submitMutation = useSubmitMessage();
  const deleteMutation = useDeleteMessage();
  const deleteMultipleMutation = useDeleteMessages();

  const currentPrincipal = identity?.getPrincipal().toString();

  // Initialize name input when display name is loaded
  useEffect(() => {
    if (!nameLoading && displayName) {
      setNameInput(displayName);
    }
  }, [displayName, nameLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clear selection when exiting multi-select mode
  useEffect(() => {
    if (!multiSelectMode) {
      setSelectedMessageIds(new Set());
    }
  }, [multiSelectMode]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    
    if (!trimmed) {
      setNameError('Please enter your name');
      return;
    }

    setDisplayName(trimmed);
    setNameError('');
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedText = messageText.trim();
    if (!trimmedText || submitMutation.isPending || !hasDisplayName) return;

    try {
      await submitMutation.mutateAsync({ text: trimmedText, displayName });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isMessageOwner = (messageSender: string): boolean => {
    if (!currentPrincipal) return false;
    return messageSender === currentPrincipal;
  };

  const handleDeleteClick = (messageId: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToDelete(messageId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete === null) return;
    
    try {
      await deleteMutation.mutateAsync(messageToDelete);
      setDeleteConfirmOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleToggleSelect = (messageId: bigint) => {
    setSelectedMessageIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    if (selectedMessageIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedMessageIds.size === 0) return;

    try {
      await deleteMultipleMutation.mutateAsync(Array.from(selectedMessageIds));
      setBulkDeleteConfirmOpen(false);
      setSelectedMessageIds(new Set());
      setMultiSelectMode(false);
    } catch (error) {
      console.error('Failed to delete messages:', error);
    }
  };

  // Show name prompt if no display name is set
  if (!nameLoading && !hasDisplayName) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-semibold">Welcome to Chat</h2>
            <p className="text-muted-foreground">
              Please enter your display name to start chatting
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError('');
                }}
                autoFocus
                maxLength={50}
              />
              {nameError && (
                <p className="text-sm text-destructive">{nameError}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Continue to Chat
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4 max-w-3xl mx-auto">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading messages...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load messages. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && messages && messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Be the first to say hello!</p>
            </div>
          )}

          {!isLoading && !error && messages && messages.length > 0 && (
            <>
              {/* Multi-select controls */}
              {currentPrincipal && (
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMultiSelectMode(!multiSelectMode)}
                  >
                    {multiSelectMode ? (
                      <>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Cancel Selection
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Select Multiple
                      </>
                    )}
                  </Button>

                  {multiSelectMode && selectedMessageIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={deleteMultipleMutation.isPending}
                    >
                      {deleteMultipleMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected ({selectedMessageIds.size})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {messages.map((message) => {
                const isOwner = isMessageOwner(message.sender.toString());
                const isSelected = selectedMessageIds.has(message.id);

                return (
                  <div
                    key={message.id.toString()}
                    className={`group relative p-4 rounded-lg transition-colors ${
                      multiSelectMode && isOwner
                        ? isSelected
                          ? 'bg-primary/10 border-2 border-primary cursor-pointer'
                          : 'bg-muted/50 border-2 border-transparent hover:border-muted-foreground/20 cursor-pointer'
                        : 'bg-muted/50'
                    }`}
                    onClick={() => {
                      if (multiSelectMode && isOwner) {
                        handleToggleSelect(message.id);
                      }
                    }}
                  >
                    {multiSelectMode && isOwner && (
                      <div className="absolute top-2 left-2">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    )}

                    <div className={`flex items-start gap-3 ${multiSelectMode && isOwner ? 'ml-8' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            {message.displayName}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeOnly(message.created)}
                        </p>
                      </div>

                      {!multiSelectMode && isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(message.id, e)}
                          disabled={deleteMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleMessageSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={submitMutation.isPending || !hasDisplayName}
              className="flex-1"
              maxLength={500}
            />
            <Button
              type="submit"
              disabled={
                !messageText.trim() ||
                submitMutation.isPending ||
                !hasDisplayName
              }
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedMessageIds.size} selected message(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMultipleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
