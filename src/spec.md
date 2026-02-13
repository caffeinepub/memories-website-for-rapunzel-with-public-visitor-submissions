# Specification

## Summary
**Goal:** Require both a username and the existing 4-digit access code on the lock screen, unlocking only for approved usernames.

**Planned changes:**
- Update the PasswordGate (lock screen) UI to add a free-text “Username” input above the existing 4-digit numeric “Access Code” (PIN) input, with clear English labels and helper text matching the current warm theme.
- Adjust unlock validation so the site unlocks only when the username is exactly “tingi99” or “meow99” AND the access code is exactly “5699”, with clear English error messaging on failure.
- Keep session-only persistence for the unlocked state when credentials are valid, and ensure the existing “Lock” action fully re-locks (clears session unlocked state) so the username+code gate appears again.

**User-visible outcome:** Visitors must enter an approved username (“tingi99” or “meow99”) plus the 4-digit code “5699” to access the site; unlock persists only for the current browser session and can be reset via the existing Lock button.
