# Specification

## Summary
**Goal:** Roll back the app to Live Version 21 behavior and fix backend persistence/reliability issues for memories and chat (including correct frontend delete calls).

**Planned changes:**
- Revert frontend and backend to the exact behavior/feature set of Live Version 21, removing all features introduced in Versions 22–24 (including dynamic lock screen phrase rotation and changing background behavior) and ensuring no V22–V24-only assets/code are referenced by the running UI.
- Update backend memory write/edit flows so new and edited memories persist across canister upgrades/redeploys and appear immediately in the memory list after successful writes.
- Update backend chat message storage so submitted messages persist across upgrades/redeploys, are returned in a stable deterministic order, and deletions work reliably using the IDs provided by the frontend.
- Fix frontend chat delete mutations to send message IDs in the exact Candid type expected by `deleteChatMessages`, and refresh UI state after deletion so removed messages disappear without a full page refresh.

**User-visible outcome:** The app behaves like Live Version 21 (no V22–V24 lock screen rotation/background changes), memories and chat reliably save and remain after redeploys, and chat message deletion works correctly and updates the UI immediately.
