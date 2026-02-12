# Specification

## Summary
**Goal:** Replace the existing Tingi search assistant with a new bottom-right floating helper widget named “Piddu” that provides a deterministic, scripted chat experience (no search, no backend/LLM calls) and a fully new UI look.

**Planned changes:**
- Remove/replace the existing Tingi widget UI and introduce a new “Piddu” floating chat widget with a distinct visual design (open/close, message history, input, send, loading state).
- Implement deterministic/scripted response logic entirely on the frontend with no network requests triggered by chat messages.
- Remove Tingi search wiring from the frontend (React Query hook/export, config/search helper modules, and any remaining Tingi search types/usages).
- Remove the Tingi Google Custom Search API and HTTP outcall logic from the Motoko backend so no search/summarization endpoints remain, while keeping existing memories APIs working.
- Update the app shell to render the Piddu widget only in the main memories experience (after the 4-digit unlock and welcome dismissal), leaving the rest of the layout unchanged.

**User-visible outcome:** After unlocking and dismissing the welcome page, visitors see a new “Piddu” chat-style helper launcher in the bottom-right that can chat using deterministic scripted replies (with a loading indicator), with no search or backend-powered responses.
