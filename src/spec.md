# Specification

## Summary
**Goal:** Restrict memory viewing and editing behavior based on which username (tingi99 vs meow99) was used to unlock, while keeping the unlock state for the current session only.

**Planned changes:**
- Persist the successfully-unlocked username in `sessionStorage` and expose it through the existing password-gate state so the UI can tell which unlock role is active.
- Ensure the existing **Lock** action fully re-locks the app by clearing both the stored unlocked flag and the stored unlocked username from `sessionStorage`.
- Apply username-based filtering to **Memories list** and **Memory full-screen viewer** only: show all memories for `tingi99`, and only memories whose `submitter` matches the current Internet Identity principal for `meow99`.
- Update the Memories empty state (for `meow99` with no matching memories) to explain in English that only the visitor’s own memories are visible under `meow99`.
- Apply username-based editing rules only within the memory editing experience: keep existing “only submitter can edit” behavior for `tingi99`, and for `meow99` only allow editing of memories that are visible under the `meow99` filter and match the current principal (with backend edit authorization unchanged).

**User-visible outcome:** After unlocking, a refresh keeps the user unlocked for the session and retains whether they unlocked as `tingi99` or `meow99`; `tingi99` can browse all memories (while edits still require being the submitter), and `meow99` can only see and edit their own memories, with other features (Music Box, YouTube links) unchanged.
