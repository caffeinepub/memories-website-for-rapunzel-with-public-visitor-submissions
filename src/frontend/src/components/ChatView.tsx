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

  const isSendDisabled = !messageText.trim() || submitMutation.isPending || !hasDisplayName;

  // Show name prompt if no display name is set
  const showNamePrompt = !nameLoading && !hasDisplayName;

  // Count owned messages that are selected
  const ownedSelectedCount = messages?.filter(
    (msg) => selectedMessageIds.has(msg.id) && isMessageOwner(msg.sender.toString())
  ).length || 0;

  if (showNamePrompt) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <User className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Welcome to Chat</h3>
            <p className="text-sm text-muted-foreground">
              Please enter your name to start chatting
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-name">Your Name</Label>
              <Input
                id="chat-name"
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError('');
                }}
                maxLength={50}
                autoFocus
              />
            </div>

            {nameError && (
              <Alert variant="destructive">
                <AlertDescription>{nameError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Multi-select toolbar */}
      {currentPrincipal && messages && messages.some((msg) => isMessageOwner(msg.sender.toString())) && (
        <div className="px-4 py-2 border-b border-border/50 bg-card/30 flex items-center justify-between gap-2 flex-shrink-0">
          <Button
            variant={multiSelectMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMultiSelectMode(!multiSelectMode)}
            className="text-xs"
          >
            {multiSelectMode ? 'Cancel' : 'Select'}
          </Button>
          {multiSelectMode && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedMessageIds.size === 0 || deleteMultipleMutation.isPending}
              className="text-xs"
            >
              {deleteMultipleMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-3 h-3 mr-1" />
              )}
              Delete ({ownedSelectedCount})
            </Button>
          )}
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-3">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading messages...</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No messages yet. Be the first to say hello!</p>
            </div>
          )}

          {!isLoading && !error && messages && messages.map((msg) => {
            const isOwner = isMessageOwner(msg.sender.toString());
            const isSelected = selectedMessageIds.has(msg.id);

            return (
              <div
                key={msg.id.toString()}
                onClick={() => multiSelectMode && isOwner && handleToggleSelect(msg.id)}
                className={`group relative p-3 rounded-lg transition-all ${
                  isOwner
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted/50 mr-8'
                } ${
                  multiSelectMode && isOwner
                    ? 'cursor-pointer hover:bg-primary/20'
                    : ''
                } ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Multi-select checkbox */}
                {multiSelectMode && isOwner && (
                  <div className="absolute top-2 left-2">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Delete icon for owned messages (normal mode) */}
                {!multiSelectMode && isOwner && (
                  <button
                    onClick={(e) => handleDeleteClick(msg.id, e)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                )}

                <div className={multiSelectMode && isOwner ? 'pl-6' : ''}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {msg.displayName}
                    </span>
                    {isOwner && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeOnly(msg.created)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-card/30 flex-shrink-0">
        <form onSubmit={handleMessageSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={submitMutation.isPending}
            maxLength={500}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSendDisabled}
            className="flex-shrink-0"
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
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
              Are you sure you want to delete {ownedSelectedCount} selected message{ownedSelectedCount !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
