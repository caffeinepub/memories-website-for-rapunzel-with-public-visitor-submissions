# Specification

## Summary
**Goal:** Add a dedicated full-page Chat view that can be opened in a new browser tab from the existing floating Chat launcher, while sharing the same chat timeline and session state.

**Planned changes:**
- Add a new full-page Chat UI route/view reachable via a URL mode/parameter that uses existing backend + React Query chat hooks and the shared timeline.
- Ensure the full-page Chat supports: display-name requirement, viewing messages, sending messages, per-message delete for own messages, and multi-select delete for own messages.
- Match existing widget message formatting by showing time-only timestamps placed under the message text, and keep styling consistent with the warm Tailwind/shadcn theme for mobile and desktop.
- Update the bottom-right floating Chat launcher to open the full-page Chat view in a new browser tab while keeping the existing in-page floating chat UI available and usable alongside it.
- Ensure the new tab reuses the current session’s unlocked state and (if present) chat display name without putting sensitive credentials (PIN) in the URL, and without causing a redundant unlock step solely due to opening a new tab.

**User-visible outcome:** Users can click the floating Chat launcher to open a full-page Chat in a new tab (without re-unlocking or re-entering a display name when already set), while still being able to use the original floating chat widget in the current tab without interfering with other bottom-right launchers.
